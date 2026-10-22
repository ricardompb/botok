import { useState, type FormEvent } from 'react';
import { apiErrorMessage } from '../../../shared/api/api-error';
import { Icon } from '../../../shared/components/Icon';
import { useModal } from '../../../shared/hooks/use-modal';
import { useAuth } from '../../auth/hooks/use-auth';
import { useCatalog } from '../../catalog/hooks/use-catalog';
import { supportService } from '../services/support.service';

const CATEGORIES = [
  'Problema técnico',
  'Acesso ou licença',
  'Orientação de uso',
  'Sugestão de melhoria',
  'Contratação de outro assistente',
  'Outro assunto — solicitar retorno',
];

const ISSUES = [
  'Não consigo entrar na plataforma',
  'Não recebo resposta do assistente',
  'Aparece um erro ao enviar',
  'Meu acesso ou saldo está indisponível',
  'Preciso de ajuda para utilizar',
  'Gostaria de apresentar uma sugestão',
  'Quero conhecer outra solução',
  'Prefiro explicar no retorno da equipe',
];

const IMPACTS = ['Sim', 'Parcialmente', 'Não', 'Não se aplica'];

interface Props {
  /** E-mail de retorno quando ainda não há sessão (tela de entrada). */
  email?: string;
  contextAgentId?: string;
}

export function SupportForm({ email, contextAgentId = '' }: Props) {
  const { user } = useAuth();
  const { catalog } = useCatalog(user?.role === 'user');
  const { dismiss, info } = useModal();
  const [category, setCategory] = useState('');
  const [issue, setIssue] = useState('');
  const [agentId, setAgentId] = useState(contextAgentId);
  const [impact, setImpact] = useState(IMPACTS[0]);
  const [error, setError] = useState('');
  const replyTo = user?.email ?? email ?? '';

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!category || !issue) return;
    try {
      const receipt = await supportService.create({
        category,
        issue,
        impact,
        agentId: agentId || undefined,
        email: user ? undefined : replyTo,
      });
      info(
        'Solicitação simulada',
        <>
          <p>
            <b>Protocolo {receipt.protocol}</b>
          </p>
          <p>
            {receipt.category} · {receipt.issue}
          </p>
          <p>
            Na plataforma real, a solicitação seguirá para o canal de atendimento da IT’s OK. Aqui, nenhum
            e-mail foi enviado nem chamado externo foi aberto.
          </p>
          <p>A conversa não foi incluída, consultada ou descartada por este formulário.</p>
        </>,
      );
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível enviar a solicitação.'));
    }
  }

  return (
    <>
      <p>
        Selecione o assunto. A equipe retornará ao e-mail cadastrado. Não é possível anexar arquivos ou
        incluir o conteúdo da conversa neste formulário.
      </p>
      <form id="support-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="support-category">Assunto</label>
          <select id="support-category" required value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Selecione</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="support-issue">O que você precisa?</label>
          <select id="support-issue" required value={issue} onChange={(e) => setIssue(e.target.value)}>
            <option value="">Selecione</option>
            {ISSUES.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="support-agent">Assistente relacionado</label>
          <select id="support-agent" value={agentId} onChange={(e) => setAgentId(e.target.value)}>
            <option value="">Plataforma em geral</option>
            {catalog?.available.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="support-impact">Você consegue continuar utilizando?</label>
          <select id="support-impact" value={impact} onChange={(e) => setImpact(e.target.value)}>
            {IMPACTS.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </div>
        <div className="notice">
          <Icon name="shield" />
          <p>
            Retorno demonstrativo: {replyTo}.
            <br />
            Somente as opções selecionadas e os dados de identificação do cadastro compõem a solicitação.
            Nenhuma mensagem é incluída.
          </p>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button type="button" className="button secondary" onClick={dismiss}>
            Cancelar
          </button>
          <button className="button" type="submit">
            Simular envio
          </button>
        </div>
      </form>
    </>
  );
}
