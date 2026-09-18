export type Role = "aluno" | "tutor" | "gestor";
export type SituacaoAluno = "normal" | "atencao" | "risco";

export interface Profile {
  id: string;
  role: Role;
  nome: string;
  avatar_url?: string;
}

export interface Escola {
  id: string;
  nome: string;
  endereco: string;
  lat: number;
  lng: number;
  raio_metros: number;
  horario_entrada: string;
  horario_saida: string;
}

export interface Aluno {
  id: string;
  user_id: string;
  escola_id: string;
  tutor_id?: string;
  ra: string;               // ← Registro do Aluno (era matrícula)
  turma: string;
  trabalha: boolean;
  tipo_trabalho?: string;
  dias_trabalho?: string[];
  trabalho_entrada?: string;
  trabalho_saida?: string;
  profile?: Profile;
  escola?: Escola;
  situacao?: SituacaoAluno;
  faltas_total?: number;
  atividades_pendentes?: number;
  media?: number;
}

export interface Falta {
  id: string;
  aluno_id: string;
  materia: string;
  data: string;
  justificativa?: string;
}

export interface Atividade {
  id: string;
  aluno_id: string;
  materia: string;
  tipo: string;
  data: string;
  status: "pendente" | "concluida";
  conteudo_url?: string;
}

export interface Presenca {
  id: string;
  aluno_id: string;
  escola_id: string;
  data: string;
  confirmada_em?: string;
  lat_aluno?: number;
  lng_aluno?: number;
  dentro_do_raio?: boolean;
  status: "confirmada" | "ausente" | "justificada";
  justificativa?: string;
}

export interface Acompanhamento {
  id: string;
  tutor_id: string;
  aluno_id: string;
  data: string;
  plano: string[];
  observacoes?: string;
  aluno?: Aluno;
}

export interface Mensagem {
  id: string;
  remetente_id: string;
  destinatario_id: string;
  texto: string;
  created_at: string;
  lida: boolean;
}

export interface Tutor {
  id: string;
  nome: string;
  especialidade: string;
  ultima_conversa?: string;
  proximo_acompanhamento?: string;
  situacao?: string;
  avatar_url?: string;
}
