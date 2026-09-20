import { Aluno, Falta, Atividade, Acompanhamento, Mensagem, Escola } from "./types";

export const mockEscola: Escola = {
  id: "escola-1",
  nome: "EE Prof. Eurípedes Simões de Paula",
  endereco: "Endereço da escola",
  lat: -23.5505,
  lng: -46.6333,
  raio_metros: 100,
  horario_entrada: "14:15",
  horario_saida: "21:15",
};

export const mockAluno: Aluno = {
  id: "", user_id: "", escola_id: "", matricula: "", turma: "", trabalha: false,
  profile: { id: "", role: "aluno", nome: "Carregando..." },
  escola: mockEscola,
  situacao: "normal", faltas_total: 0, atividades_pendentes: 0, media: 0,
};

export const mockFaltas: Falta[] = [];
export const mockAtividades: Atividade[] = [];
export const mockTutor = {
  id: "", nome: "Tutor", especialidade: "",
  ultima_conversa: "--", proximo_acompanhamento: "--",
  situacao: "--", avatar_url: "",
};
export const mockAlunosTutor: Aluno[] = [];
export const mockMensagens: Mensagem[] = [];