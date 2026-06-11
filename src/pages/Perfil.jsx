/**
 * Perfil.jsx — Tela de perfil e configurações do aluno
 *
 * Abas:
 *  1. Conta      — nome, e-mail, foto
 *  2. Escolar    — escola, série, matérias difíceis, vestibulares
 *  3. Aparência  — modo escuro (toggle)
 *
 * Sincroniza o modoEscuro com a API (perfil-aluno.modoEscuro).
 */
import { useState, useEffect } from 'react';
import { User, School, Palette, Save, CheckCircle, Camera } from 'lucide-react';
import { buscarPerfil, salvarPerfil, atualizarUsuario } from '../api/perfil';
import { useAuth }  from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Card    from '../components/common/Card';
import Button  from '../components/common/Button';
import Input   from '../components/common/Input';
import Toggle  from '../components/common/Toggle';
import Spinner from '../components/common/Spinner';

// Abas disponíveis
const ABAS = [
  { id: 'conta',    label: 'Conta',    icon: User    },
  { id: 'escolar',  label: 'Escolar',  icon: School  },
  { id: 'aparencia',label: 'Aparência',icon: Palette },
];

export default function Perfil() {
  const { usuario, atualizarUsuario: atualizarCtx } = useAuth();
  const { isDark, definirTema }                      = useTheme();

  const [abaAtiva,   setAbaAtiva]   = useState('conta');
  const [carregando, setCarregando] = useState(true);
  const [salvando,   setSalvando]   = useState(false);
  const [sucesso,    setSucesso]    = useState('');

  // Dados do perfil aluno (API)
  const [perfilAluno, setPerfilAluno] = useState(null);

  // Campos do formulário — Conta
  const [nome,    setNome]    = useState('');
  const [email,   setEmail]   = useState('');
  const [fotoUrl, setFotoUrl] = useState('');

  // Campos — Escolar
  const [nomeEscola,     setNomeEscola]     = useState('');
  const [escolaridade,   setEscolaridade]   = useState('');
  const [serieAno,       setSerieAno]       = useState('');
  const [vestibulares,   setVestibulares]   = useState([]);
  const [materiasDificeis, setMateriasDificeis] = useState([]);

  // Carrega dados ao montar
  useEffect(() => {
    const carregar = async () => {
      try {
        setNome(usuario?.nome   ?? '');
        setEmail(usuario?.email ?? '');
        setFotoUrl(usuario?.fotoUrl ?? '');

        if (usuario?.id) {
          const perfil = await buscarPerfil(usuario.id);
          setPerfilAluno(perfil);
          setNomeEscola(perfil?.nomeEscola ?? '');
          setEscolaridade(perfil?.escolaridade ?? '');
          setSerieAno(perfil?.serieAno ?? '');
          setVestibulares(perfil?.vestibulares ?? []);
          setMateriasDificeis(perfil?.materiasDificeis ?? []);

          // Sincroniza dark mode da API com o contexto
          if (typeof perfil?.modoEscuro === 'boolean') {
            definirTema(perfil.modoEscuro);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [usuario?.id]);

  // Salvar aba Conta
  const salvarConta = async () => {
    setSalvando(true);
    try {
      const atualizado = await atualizarUsuario(usuario.id, { nome, email, fotoUrl: fotoUrl || null });
      atualizarCtx({ nome: atualizado.nome ?? nome, email: atualizado.email ?? email });
      mostrarSucesso('Conta atualizada com sucesso!');
    } catch {
      mostrarSucesso('Erro ao salvar. Tente novamente.', true);
    } finally {
      setSalvando(false);
    }
  };

  // Salvar aba Escolar
  const salvarEscolar = async () => {
    setSalvando(true);
    try {
      await salvarPerfil(usuario.id, {
        nomeEscola,
        escolaridade,
        serieAno,
        vestibulares,
        materiasDificeis,
      });
      mostrarSucesso('Perfil escolar atualizado!');
    } catch {
      mostrarSucesso('Erro ao salvar. Tente novamente.', true);
    } finally {
      setSalvando(false);
    }
  };

  // Salvar modo escuro na API
  const salvarModoEscuro = async (valor) => {
    definirTema(valor); // atualiza localmente já
    try {
      await salvarPerfil(usuario.id, { modoEscuro: valor });
    } catch {
      // Falha silenciosa; o localStorage já salvou
    }
  };

  // Helper: exibe mensagem de sucesso temporária
  const mostrarSucesso = (msg) => {
    setSucesso(msg);
    setTimeout(() => setSucesso(''), 3000);
  };

  // Toggle de item em lista (vestibulares, matérias)
  const toggleLista = (lista, setLista, item) => {
    setLista((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        {/* Avatar grande */}
        <div className="relative">
          <div className="w-20 h-20 gradient-brand rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-brand-md">
            {nome ? nome[0].toUpperCase() : '?'}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-sm">
            <Camera size={12} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{nome || 'Meu Perfil'}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{email}</p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        {ABAS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setAbaAtiva(id)}
            className={[
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
              abaAtiva === id
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
            ].join(' ')}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Mensagem de sucesso */}
      {sucesso && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm animate-slideDown">
          <CheckCircle size={16} />
          {sucesso}
        </div>
      )}

      {/* ── Aba: Conta ─────────────────────────────────────────── */}
      {abaAtiva === 'conta' && (
        <Card className="animate-slideUp space-y-4" padding="lg">
          <Input
            label="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            icon={<User size={15} />}
            placeholder="Seu nome"
          />
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
          <Input
            label="URL da foto (opcional)"
            value={fotoUrl}
            onChange={(e) => setFotoUrl(e.target.value)}
            placeholder="https://..."
            hint="Cole a URL de uma imagem para usar como avatar"
          />
          <Button
            variant="primary" size="md"
            loading={salvando}
            icon={!salvando && <Save size={15} />}
            onClick={salvarConta}
          >
            Salvar alterações
          </Button>
        </Card>
      )}

      {/* ── Aba: Escolar ───────────────────────────────────────── */}
      {abaAtiva === 'escolar' && (
        <Card className="animate-slideUp space-y-5" padding="lg">
          <Input
            label="Nome da escola"
            value={nomeEscola}
            onChange={(e) => setNomeEscola(e.target.value)}
            icon={<School size={15} />}
            placeholder="Ex: Colégio Estadual..."
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Escolaridade */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                Escolaridade
              </label>
              <select
                value={escolaridade}
                onChange={(e) => setEscolaridade(e.target.value)}
                className="input-custom"
              >
                <option value="">Selecione</option>
                <option value="ensino_fundamental">Ensino Fundamental</option>
                <option value="ensino_medio">Ensino Médio</option>
              </select>
            </div>

            {/* Série */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                Série / Ano
              </label>
              <select
                value={serieAno}
                onChange={(e) => setSerieAno(e.target.value)}
                className="input-custom"
              >
                <option value="">Selecione</option>
                {escolaridade === 'ensino_fundamental' ? (
                  ['1_ano','2_ano','3_ano','4_ano','5_ano','6_ano','7_ano','8_ano','9_ano'].map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ').replace('_', 'º ')}</option>
                  ))
                ) : (
                  ['1_serie','2_serie','3_serie'].map((s) => (
                    <option key={s} value={s}>{s.replace('_serie', 'ª Série')}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Vestibulares alvo */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
              Vestibulares alvo
            </label>
            <div className="flex flex-wrap gap-2">
              {['enem','fuvest','unicamp','unesp','vunesp','fgv','puc-sp','mack','ita','ime'].map((v) => (
                <button
                  key={v}
                  onClick={() => toggleLista(vestibulares, setVestibulares, v)}
                  className={[
                    'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
                    vestibulares.includes(v)
                      ? 'gradient-brand text-white border-transparent'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400',
                  ].join(' ')}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Matérias difíceis */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
              Matérias que precisa melhorar
            </label>
            <div className="flex flex-wrap gap-2">
              {['matematica','fisica','quimica','biologia','historia','geografia','portugues','ingles','filosofia','sociologia'].map((m) => (
                <button
                  key={m}
                  onClick={() => toggleLista(materiasDificeis, setMateriasDificeis, m)}
                  className={[
                    'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
                    materiasDificeis.includes(m)
                      ? 'bg-rose-500 text-white border-transparent'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-rose-400',
                  ].join(' ')}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary" size="md"
            loading={salvando}
            icon={!salvando && <Save size={15} />}
            onClick={salvarEscolar}
          >
            Salvar perfil escolar
          </Button>
        </Card>
      )}

      {/* ── Aba: Aparência ─────────────────────────────────────── */}
      {abaAtiva === 'aparencia' && (
        <Card className="animate-slideUp space-y-5" padding="lg">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Tema</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Alterne entre o modo claro e escuro. A preferência é salva automaticamente.
            </p>

            {/* Preview dos temas */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* Claro */}
              <button
                onClick={() => salvarModoEscuro(false)}
                className={[
                  'p-4 rounded-xl border-2 text-left transition-all',
                  !isDark ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-slate-200 dark:border-slate-700',
                ].join(' ')}
              >
                <div className="w-full h-14 bg-white rounded-lg mb-2 border border-slate-200 flex items-end p-2 gap-1">
                  <div className="h-3 w-8 bg-brand-400 rounded" />
                  <div className="h-2 w-6 bg-slate-200 rounded" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">☀️ Modo Claro</p>
              </button>

              {/* Escuro */}
              <button
                onClick={() => salvarModoEscuro(true)}
                className={[
                  'p-4 rounded-xl border-2 text-left transition-all',
                  isDark ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-slate-200 dark:border-slate-700',
                ].join(' ')}
              >
                <div className="w-full h-14 bg-slate-900 rounded-lg mb-2 border border-slate-700 flex items-end p-2 gap-1">
                  <div className="h-3 w-8 bg-brand-400 rounded" />
                  <div className="h-2 w-6 bg-slate-700 rounded" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">🌙 Modo Escuro</p>
              </button>
            </div>

            <Toggle
              checked={isDark}
              onChange={salvarModoEscuro}
              label="Modo escuro ativado"
            />
          </div>
        </Card>
      )}
    </div>
  );
}
