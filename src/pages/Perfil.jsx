import { useState, useEffect, useRef } from 'react';
import { User, School, Palette, Save, CheckCircle, Camera, X, Building2 } from 'lucide-react';
import { buscarPerfil, salvarPerfil, atualizarUsuario } from '../api/perfil';
import { useAuth }  from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Card    from '../components/common/Card';
import Button  from '../components/common/Button';
import Input   from '../components/common/Input';
import Toggle  from '../components/common/Toggle';
import Spinner from '../components/common/Spinner';

const ABAS = [
  { id: 'conta',      label: 'Conta',      icon: User      },
  { id: 'escolar',    label: 'Escolar',    icon: School    },
  { id: 'faculdade',  label: 'Faculdade',  icon: Building2 },
  { id: 'aparencia',  label: 'Aparência',  icon: Palette   },
];


export default function Perfil() {
  const { usuario, atualizarUsuario: atualizarCtx } = useAuth();
  const { isDark, definirTema }                      = useTheme();
  const fileInputRef = useRef(null);

  const [abaAtiva,   setAbaAtiva]   = useState('conta');
  const [carregando, setCarregando] = useState(true);
  const [salvando,   setSalvando]   = useState(false);
  const [sucesso,    setSucesso]    = useState('');

  // Conta
  const [nome,    setNome]    = useState('');
  const [email,   setEmail]   = useState('');
  const [fotoUrl, setFotoUrl] = useState('');

  // Escolar
  const [nomeEscola,       setNomeEscola]       = useState('');
  const [escolaridade,     setEscolaridade]     = useState('');
  const [serieAno,         setSerieAno]         = useState('');
  const [vestibulares,     setVestibulares]     = useState([]);
  const [materiasDificeis, setMateriasDificeis] = useState([]);

  // Faculdades
  const [vestibularAlvo,   setVestibularAlvo]   = useState('');  // Faculdade Alvo 1 nome
  const [graduacaoAlvo,    setGraduacaoAlvo]    = useState('');  // Fac1 — 1ª opção curso
  const [graduacaoAlvo2,   setGraduacaoAlvo2]   = useState('');  // Fac1 — 2ª opção curso
  const [faculdade2,       setFaculdade2]       = useState('');  // Faculdade Alvo 2 nome (→ graduacaoAlvo3)
  const [faculdade2Curso1, setFaculdade2Curso1] = useState('');  // Fac2 — 1ª opção curso
  const [faculdade2Curso2, setFaculdade2Curso2] = useState('');  // Fac2 — 2ª opção curso

  useEffect(() => {
    const carregar = async () => {
      try {
        setNome(usuario?.nome   ?? '');
        setEmail(usuario?.email ?? '');
        setFotoUrl(usuario?.fotoUrl ?? '');

        if (usuario?.id) {
          const perfil = await buscarPerfil(usuario.id);
          setNomeEscola(perfil?.nomeEscola ?? '');
          setEscolaridade(perfil?.escolaridade ?? '');
          setSerieAno(perfil?.serieAno ?? '');
          setVestibulares(perfil?.vestibulares ?? []);
          setMateriasDificeis(perfil?.materiasDificeis ?? []);
          setVestibularAlvo(perfil?.vestibularAlvo ?? '');
          setGraduacaoAlvo(perfil?.graduacaoAlvo ?? '');
          setGraduacaoAlvo2(perfil?.graduacaoAlvo2 ?? '');
          setFaculdade2(perfil?.graduacaoAlvo3 ?? '');
          setFaculdade2Curso1(perfil?.faculdadeAlvo2Curso1 ?? '');
          setFaculdade2Curso2(perfil?.faculdadeAlvo2Curso2 ?? '');

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

  // Redimensiona a foto selecionada para 200×200 JPEG e armazena como data URL
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const size   = 200;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx    = canvas.getContext('2d');
        const dim    = Math.min(img.width, img.height);
        const ox     = (img.width  - dim) / 2;
        const oy     = (img.height - dim) / 2;
        ctx.drawImage(img, ox, oy, dim, dim, 0, 0, size, size);
        setFotoUrl(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const salvarConta = async () => {
    setSalvando(true);
    try {
      const atualizado = await atualizarUsuario(usuario.id, { nome, email, fotoUrl: fotoUrl || null });
      atualizarCtx({
        nome:    atualizado.nome    ?? nome,
        email:   atualizado.email   ?? email,
        fotoUrl: fotoUrl || null,
      });
      mostrarSucesso('Conta atualizada com sucesso!');
    } catch {
      mostrarSucesso('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const salvarEscolar = async () => {
    setSalvando(true);
    try {
      await salvarPerfil(usuario.id, {
        nomeEscola,
        escolaridade,
        serieAno,
        vestibulares,
        materiasDificeis,
        vestibularAlvo:   vestibularAlvo   || null,
        graduacaoAlvo:    graduacaoAlvo    || null,
        graduacaoAlvo2:   graduacaoAlvo2   || null,
        graduacaoAlvo3:   faculdade2       || null,
        faculdade2Curso1: faculdade2Curso1 || null,
        faculdade2Curso2: faculdade2Curso2 || null,
      });
      mostrarSucesso('Perfil escolar atualizado!');
    } catch {
      mostrarSucesso('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const salvarModoEscuro = async (valor) => {
    definirTema(valor);
    try { await salvarPerfil(usuario.id, { modoEscuro: valor }); } catch { /* silent */ }
  };

  const mostrarSucesso = (msg) => {
    setSucesso(msg);
    setTimeout(() => setSucesso(''), 3000);
  };

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
      {/* Cabeçalho com avatar */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt="Foto de perfil"
              className="w-20 h-20 rounded-2xl object-cover shadow-brand-md"
              onError={() => setFotoUrl('')}
            />
          ) : (
            <div className="w-20 h-20 gradient-brand rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-brand-md">
              {nome ? nome[0].toUpperCase() : '?'}
            </div>
          )}
          <button
            onClick={() => { setAbaAtiva('conta'); setTimeout(() => fileInputRef.current?.click(), 50); }}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-sm"
          >
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

      {/* Mensagem de feedback */}
      {sucesso && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm animate-slideDown">
          <CheckCircle size={16} />
          {sucesso}
        </div>
      )}

      {/* ── Aba: Conta ────────────────────────────────────────────── */}
      {abaAtiva === 'conta' && (
        <Card className="animate-slideUp space-y-5" padding="lg">
          {/* Foto de perfil */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-3">
              Foto de perfil
            </label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="relative shrink-0">
                {fotoUrl ? (
                  <img
                    src={fotoUrl}
                    alt="Preview"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-600"
                    onError={() => setFotoUrl('')}
                  />
                ) : (
                  <div className="w-20 h-20 gradient-brand rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                    {nome ? nome[0].toUpperCase() : '?'}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-sm"
                >
                  <Camera size={12} className="text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Ações */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="secondary" size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<Camera size={14} />}
                >
                  Escolher foto
                </Button>
                {fotoUrl && (
                  <button
                    onClick={() => setFotoUrl('')}
                    className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 transition-colors"
                  >
                    <X size={12} />
                    Remover foto
                  </button>
                )}
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  JPEG/PNG · será salva no banco
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFotoChange}
              className="hidden"
            />
          </div>

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

      {/* ── Aba: Escolar ──────────────────────────────────────────── */}
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
                    <option key={s} value={s}>{s.replace('_ano', 'º Ano')}</option>
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

      {/* ── Aba: Faculdade ───────────────────────────────────────── */}
      {abaAtiva === 'faculdade' && (
        <Card className="animate-slideUp space-y-5" padding="lg">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-1">
              <Building2 size={16} className="text-brand-500" />
              Faculdades Objetivo
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Defina suas faculdades alvo e os cursos desejados para cada uma.
            </p>
          </div>

          {/* Faculdade Alvo 1 */}
          <div className="p-4 rounded-xl border-2 border-brand-200 dark:border-brand-800/50 bg-brand-50 dark:bg-brand-950/20 space-y-4">
            <p className="text-sm font-bold text-brand-700 dark:text-brand-300 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full gradient-brand text-white text-xs flex items-center justify-center font-black">1</span>
              Faculdade Alvo 1
            </p>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
                Nome da faculdade
              </label>
              <input
                type="text"
                value={vestibularAlvo}
                onChange={(e) => setVestibularAlvo(e.target.value)}
                maxLength={30}
                placeholder="Ex: USP, UNICAMP, UNESP..."
                className="input-custom"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
                  1ª Preferência de curso
                </label>
                <input
                  type="text"
                  value={graduacaoAlvo}
                  onChange={(e) => setGraduacaoAlvo(e.target.value)}
                  maxLength={100}
                  placeholder="Ex: Medicina, Direito..."
                  className="input-custom"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
                  2ª Opção de curso
                </label>
                <input
                  type="text"
                  value={graduacaoAlvo2}
                  onChange={(e) => setGraduacaoAlvo2(e.target.value)}
                  maxLength={100}
                  placeholder="Ex: Engenharia Civil..."
                  className="input-custom"
                />
              </div>
            </div>
          </div>

          {/* Faculdade Alvo 2 */}
          <div className="p-4 rounded-xl border-2 border-violet-200 dark:border-violet-800/50 bg-violet-50 dark:bg-violet-950/20 space-y-4">
            <p className="text-sm font-bold text-violet-700 dark:text-violet-300 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-violet-500 text-white text-xs flex items-center justify-center font-black">2</span>
              Faculdade Alvo 2
            </p>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
                Nome da faculdade
              </label>
              <input
                type="text"
                value={faculdade2}
                onChange={(e) => setFaculdade2(e.target.value)}
                maxLength={100}
                placeholder="Ex: PUC-SP, FGV, ITA, Mackenzie..."
                className="input-custom"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
                  1ª Preferência de curso
                </label>
                <input
                  type="text"
                  value={faculdade2Curso1}
                  onChange={(e) => setFaculdade2Curso1(e.target.value)}
                  maxLength={100}
                  placeholder="Ex: Medicina, Direito..."
                  className="input-custom"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
                  2ª Opção de curso
                </label>
                <input
                  type="text"
                  value={faculdade2Curso2}
                  onChange={(e) => setFaculdade2Curso2(e.target.value)}
                  maxLength={100}
                  placeholder="Ex: Engenharia Civil..."
                  className="input-custom"
                />
              </div>
            </div>
          </div>

          <Button
            variant="primary" size="md"
            loading={salvando}
            icon={!salvando && <Save size={15} />}
            onClick={salvarEscolar}
          >
            Salvar objetivos
          </Button>
        </Card>
      )}

      {/* ── Aba: Aparência ────────────────────────────────────────── */}
      {abaAtiva === 'aparencia' && (
        <Card className="animate-slideUp space-y-5" padding="lg">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Tema</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Alterne entre o modo claro e escuro. A preferência é salva automaticamente.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-5">
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
