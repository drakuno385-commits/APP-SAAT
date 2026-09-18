-- =======================================================
-- SAAT - Script de Criação do Banco de Dados (Supabase)
-- =======================================================

-- 1. Tabela de Escolas
CREATE TABLE public.escolas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  endereco TEXT,
  lat DECIMAL,
  lng DECIMAL,
  raio_metros INT DEFAULT 100,
  horario_entrada TIME,
  horario_saida TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela de Perfis (Vinculada ao Supabase Auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('aluno','tutor','gestor')) DEFAULT 'aluno',
  nome TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela de Alunos
CREATE TABLE public.alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  escola_id UUID REFERENCES public.escolas(id),
  tutor_id UUID REFERENCES public.profiles(id),
  ra TEXT UNIQUE NOT NULL,
  turma TEXT NOT NULL,
  trabalha BOOLEAN DEFAULT false,
  tipo_trabalho TEXT,
  dias_trabalho TEXT[],
  trabalho_entrada TIME,
  trabalho_saida TIME,
  situacao TEXT CHECK (situacao IN ('normal', 'atencao', 'risco')) DEFAULT 'normal',
  faltas_total INT DEFAULT 0,
  atividades_pendentes INT DEFAULT 0,
  media DECIMAL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tabela de Faltas
CREATE TABLE public.faltas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
  materia TEXT NOT NULL,
  data DATE NOT NULL,
  justificativa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tabela de Atividades
CREATE TABLE public.atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
  materia TEXT NOT NULL,
  tipo TEXT NOT NULL,
  data DATE NOT NULL,
  status TEXT CHECK (status IN ('pendente', 'concluida')) DEFAULT 'pendente',
  conteudo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Tabela de Presenças (Geolocalização)
CREATE TABLE public.presencas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
  escola_id UUID REFERENCES public.escolas(id),
  data DATE NOT NULL,
  confirmada_em TIMESTAMP WITH TIME ZONE,
  lat_aluno DECIMAL,
  lng_aluno DECIMAL,
  dentro_do_raio BOOLEAN,
  status TEXT CHECK (status IN ('confirmada', 'ausente', 'justificada')) DEFAULT 'ausente',
  justificativa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Tabela de Mensagens (Chat Tutor x Aluno)
CREATE TABLE public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remetente_id UUID REFERENCES public.profiles(id),
  destinatario_id UUID REFERENCES public.profiles(id),
  texto TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =======================================================
-- Configurações de Segurança (Row Level Security - RLS)
-- =======================================================

ALTER TABLE public.escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faltas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso básicas (Permitir tudo para testes iniciais)
-- NOTA: Em produção, você deve restringir isso!
CREATE POLICY "Permitir leitura pública" ON public.escolas FOR SELECT USING (true);
CREATE POLICY "Permitir leitura para todos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Permitir update no próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para alunos (Pode ver seus próprios dados)
CREATE POLICY "Aluno pode ver seus dados" ON public.alunos FOR SELECT USING (true);
CREATE POLICY "Permitir insert para autenticados" ON public.alunos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Leitura geral" ON public.faltas FOR SELECT USING (true);
CREATE POLICY "Leitura geral" ON public.atividades FOR SELECT USING (true);
CREATE POLICY "Leitura geral" ON public.presencas FOR SELECT USING (true);
CREATE POLICY "Leitura geral" ON public.mensagens FOR SELECT USING (true);
CREATE POLICY "Permitir envio de msg" ON public.mensagens FOR INSERT WITH CHECK (auth.uid() = remetente_id);

-- =======================================================
-- Trigger para criar perfil automaticamente no cadastro
-- =======================================================
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, role)
  VALUES (new.id, new.raw_user_meta_data->>'nome', 'aluno');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =======================================================
-- Inserir dados mock/iniciais para testes
-- =======================================================
INSERT INTO public.escolas (nome, endereco, lat, lng, raio_metros, horario_entrada, horario_saida)
VALUES (
  'EE Professora Maria Aparecida',
  'Rua das Flores, 123 - São Paulo, SP',
  -23.5505,
  -46.6333,
  100,
  '07:00',
  '16:00'
);
