import { Aluno, Escola, Falta, Atividade, Mensagem, Tutor } from "./types";

export const mockEscola: Escola = {
  id: "escola-1",
  nome: "EE Prof. Eur�pedes Sim�es de Paula",
  endereco: "Rua das Flores, 123 - São Paulo, SP",
  lat: -23.5505,
  lng: -46.6333,
  raio_metros: 100,
  horario_entrada: "07:00",
  horario_saida: "16:00",
};

export const mockAluno: Aluno = {
  id: "aluno-1",
  user_id: "user-1",
  escola_id: "escola-1",
  tutor_id: "tutor-1",
  ra: "2024020123",
  turma: "2º Ano A",
  trabalha: true,
  tipo_trabalho: "Atendente",
  dias_trabalho: ["seg", "ter", "qua", "qui", "sex"],
  trabalho_entrada: "17:00",
  trabalho_saida: "22:00",
  profile: { id: "user-1", role: "aluno", nome: "João da Silva" },
  escola: mockEscola,
  situacao: "atencao",
  faltas_total: 4,
  atividades_pendentes: 3,
  media: 7.2,
};

export const mockFaltas: Falta[] = [
  { id: "f1", aluno_id: "aluno-1", materia: "Matemática", data: "2024-08-10" },
  { id: "f2", aluno_id: "aluno-1", materia: "Matemática", data: "2024-08-15" },
  { id: "f3", aluno_id: "aluno-1", materia: "Português", data: "2024-08-12" },
  { id: "f4", aluno_id: "aluno-1", materia: "História", data: "2024-08-18" },
];

export const mockAtividades: Atividade[] = [
  { id: "a1", aluno_id: "aluno-1", materia: "Matemática", tipo: "Equação de função", data: "2024-08-20", status: "pendente" },
  { id: "a2", aluno_id: "aluno-1", materia: "Português", tipo: "Atividade de interpretação", data: "2024-08-22", status: "pendente" },
  { id: "a3", aluno_id: "aluno-1", materia: "História", tipo: "Leitura e resumo", data: "2024-08-24", status: "pendente" },
  { id: "a4", aluno_id: "aluno-1", materia: "Ciências", tipo: "Relatório de experimento", data: "2024-07-30", status: "concluida" },
];

export const mockTutor: Tutor = {
  id: "tutor-1",
  nome: "Carlos Silva",
  especialidade: "Acompanhamento escolar",
  ultima_conversa: "25/08",
  proximo_acompanhamento: "01/09",
  situacao: "Em acompanhamento",
  avatar_url: "",
};

export const mockAlunosTutor: Aluno[] = [
  {
    id: "aluno-1", user_id: "u1", escola_id: "e1",
    ra: "RA001", turma: "1º Ano A", trabalha: true,
    profile: { id: "u1", role: "aluno", nome: "João da Silva" },
    situacao: "risco", faltas_total: 8, atividades_pendentes: 6, media: 5.8,
  },
  {
    id: "aluno-2", user_id: "u2", escola_id: "e1",
    ra: "RA002", turma: "2º Ano B", trabalha: true,
    profile: { id: "u2", role: "aluno", nome: "Maria Oliveira" },
    situacao: "atencao", faltas_total: 4, atividades_pendentes: 2, media: 6.5,
  },
  {
    id: "aluno-3", user_id: "u3", escola_id: "e1",
    ra: "RA003", turma: "1º Ano A", trabalha: true,
    profile: { id: "u3", role: "aluno", nome: "Lucas Santos" },
    situacao: "normal", faltas_total: 1, atividades_pendentes: 0, media: 8.0,
  },
  {
    id: "aluno-4", user_id: "u4", escola_id: "e1",
    ra: "RA004", turma: "3º Ano B", trabalha: false,
    profile: { id: "u4", role: "aluno", nome: "Ana Paula Costa" },
    situacao: "normal", faltas_total: 0, atividades_pendentes: 1, media: 9.1,
  },
  {
    id: "aluno-5", user_id: "u5", escola_id: "e1",
    ra: "RA005", turma: "2º Ano A", trabalha: true,
    profile: { id: "u5", role: "aluno", nome: "Rafael Mendes" },
    situacao: "risco", faltas_total: 10, atividades_pendentes: 7, media: 4.5,
  },
];

export const mockMensagens: Mensagem[] = [
  { id: "m1", remetente_id: "tutor-1", destinatario_id: "aluno-1", texto: "Olá João, tudo bem? Vi que você teve algumas faltas essa semana. Podemos conversar?", created_at: "2024-08-25T10:00:00Z", lida: true },
  { id: "m2", remetente_id: "aluno-1", destinatario_id: "tutor-1", texto: "Oi professor Carlos! Tive que cobrir um turno extra no trabalho. Posso falar amanhã?", created_at: "2024-08-25T10:15:00Z", lida: true },
  { id: "m3", remetente_id: "tutor-1", destinatario_id: "aluno-1", texto: "Claro! Às 14h pode ser?", created_at: "2024-08-25T10:20:00Z", lida: false },
];

export function getFaltasPorMateria(faltas: Falta[]) {
  const materias = ["Matemática", "Português", "História", "Ciências", "Geografia", "Inglês"];
  return materias.map((m) => ({
    materia: m,
    faltas: faltas.filter((f) => f.materia === m).length,
  }));
}
