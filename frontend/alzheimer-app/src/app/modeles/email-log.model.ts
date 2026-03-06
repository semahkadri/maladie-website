export interface EmailLog {
  id: number;
  destinataire: string;
  sujet: string;
  contenuHtml: string;
  type: string;
  referenceCommande?: string;
  lu: boolean;
  dateEnvoi: string;
}
