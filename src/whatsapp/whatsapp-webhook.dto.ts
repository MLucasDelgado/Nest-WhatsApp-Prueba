export interface WhatsAppWebhookPayload {
  object: string;
  entry: {
    id: string;
    changes: {
      value: {
        messages?: {
          from: string;
          text?: {
            body: string;
          };
        }[];
      };
    }[];
  }[];
}
