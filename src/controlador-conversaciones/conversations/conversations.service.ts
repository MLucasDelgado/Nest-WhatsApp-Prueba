import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class ConversationsService {
  // Pool es un conjunto de conexiones a PostgreSQL para ejecutar consultas
  private pool: Pool;

  constructor() {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      throw new Error('DATABASE_URL is not defined in .env');
    }

    this.pool = new Pool({
      connectionString: dbUrl, // connectionString es la dirección (usuario, contraseña, host, puerto, base) para conectarse a la base de datos
    });
  }

  async upsertConversation(phone: string, name: string | null, message: string, date: Date) { // guarda la conversacion
    const client = await this.pool.connect();
    try {
      console.log('Intentando upsertConversation con:', { phone, name, message, date });
      await client.query('BEGIN');

      const res = await client.query('SELECT id FROM conversations WHERE phone = $1', [phone]);

      let conversationId: number;
      if (res.rows.length > 0) {
        conversationId = res.rows[0].id;
        await client.query(
          'UPDATE conversations SET last_message = $1, last_message_date = $2, name = COALESCE($3, name) WHERE id = $4',
          [message, date, name, conversationId],
        );
        console.log(`Actualizó conversación con id ${conversationId}`);
      } else {
        const insertRes = await client.query(
          'INSERT INTO conversations (phone, name, last_message, last_message_date) VALUES ($1, $2, $3, $4) RETURNING id',
          [phone, name, message, date],
        );
        conversationId = insertRes.rows[0].id;
      }

      await client.query('COMMIT');
      return conversationId;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error en upsertConversation:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async insertMessage(conversationId: number, from: string, message: string, date: Date) {
    try {
      await this.pool.query(
        'INSERT INTO messages (conversation_id, from_number, message, timestamp) VALUES ($1, $2, $3, $4)',
        [conversationId, from, message, date],
      );
    } catch (error) {
      console.error('Error insertando mensaje:', error);
      throw error;
    }
  }

  async getRecentConversations() {
    const result = await this.pool.query(`
      SELECT phone, name, last_message, last_message_date
      FROM conversations
      ORDER BY last_message_date DESC
      LIMIT 50
    `);
    return result.rows;
  }

  async getMessageById(conversationId: number) {
    const result = this.pool.query(
      `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY timestamp ASC`, [conversationId]
    );
    return result;
  }
}
