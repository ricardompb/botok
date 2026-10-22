import { Icon } from '../../../shared/components/Icon';
import { useDocumentTitle } from '../../../shared/hooks/use-document-title';

/** Guia para apresentação e orçamento (conteúdo estático do protótipo). */
export function BriefPage() {
  useDocumentTitle('Sobre o projeto');
  return (
    <section id="view-brief" className="view">
      <div className="page brief">
        <div className="page-title">
          <div>
            <span className="eyebrow">Guia para apresentação e orçamento · Versão 2</span>
            <h1>A ideia, por trás das telas.</h1>
            <p>
              Um portal próprio para distribuir e administrar assistentes já utilizados, preservando a metodologia da
              IT’s OK.
            </p>
          </div>
        </div>
        <div className="notice">
          <Icon name="info" />
          <p>
            Este HTML é uma demonstração de experiência e escopo. Não executa IA, autenticação ou controle real de
            licenças. Os exemplos são fictícios, ficam apenas na memória da página e são reiniciados ao recarregar.
          </p>
        </div>
        <div className="steps">
          <span>1. Entrada individual</span>
          <i>→</i>
          <span>2. Assistentes contratados</span>
          <i>→</i>
          <span>3. Conversa com contexto</span>
          <i>→</i>
          <span>4. Encerramento sem histórico</span>
        </div>
        <div className="scope-grid">
          <div>
            <b>Para o usuário</b>
            <p>Apoio pontual para preparar discursos, mensagens, entrevistas e conversas difíceis.</p>
          </div>
          <div>
            <b>Para a IT’s OK</b>
            <p>Administração de empresas, usuários, licenças, permissões e consumo.</p>
          </div>
          <div>
            <b>Para o negócio</b>
            <p>Contratos B2B negociados diretamente. Plataforma independente da LMS e sem pagamentos.</p>
          </div>
        </div>
        <details open>
          <summary>01 · O que demonstrar nesta reunião</summary>
          <p>
            Use a barra superior para percorrer Entrada → Assistentes → Administração. Abra um assistente, escolha uma
            sugestão, envie uma mensagem e experimente ampliar a conversa. Os textos de resposta são exemplos fixos: não
            analisam o que foi digitado.
          </p>
          <p>
            Na administração, abra uma empresa, altere permissões ou adicione um usuário fictício. Em “Gerenciar
            agentes”, simule a verificação adicional, cadastre um agente e autorize sua utilização na empresa. Agentes
            exclusivos ficam restritos ao cliente destinatário. O “Fale conosco” usa opções estruturadas, sem anexos ou
            conteúdo de conversa. Na Construtora Horizonte, as permissões salvas também alteram o catálogo
            demonstrativo de Ana. “Apresentar” oculta a barra de demonstração; o botão no canto inferior ou a tecla Esc
            a restaura.
          </p>
        </details>
        <details open>
          <summary>02 · Escopo inicial para orçamento</summary>
          <ul>
            <li>
              Portal responsivo, autenticação individual, recuperação de acesso e verificação adicional. Mitigação do
              compartilhamento de credenciais por controles de sessão, a definir tecnicamente.
            </li>
            <li>
              Cadastro de empresas, usuários e vagas; ativação, suspensão e transferência de licenças conforme regra a
              detalhar; vigência e permissões por assistente.
            </li>
            <li>
              Integração com cinco assistentes: ROTA, Gestão de Crise, Media Training, TOC e Redes Sociais. Confirmar
              nomes e configurações finais.
            </li>
            <li>
              Conversa em texto responsiva no computador e celular, sem voz nesta etapa; contexto temporário, sugestões
              de início, cópia de respostas e encerramento explícito.
            </li>
            <li>Manual de Bordo aprovado pela IT’s OK, vinculado ao assistente e à sua versão.</li>
            <li>
              Console de agentes com cadastro, edição, teste de conexão, suspensão, arquivamento e exclusão condicionada
              a dependências. Permitir agentes genéricos e exclusivos, sem alteração de código para integrações
              compatíveis.
            </li>
            <li>
              Área restrita por perfil e verificação adicional; segredos no backend/cofre, sem revelar seu valor na
              interface. Campos definitivos da conexão a validar tecnicamente.
            </li>
            <li>
              Fale conosco estruturado, sem campo livre, anexos, importação ou transmissão da conversa; identificação do
              usuário, assunto e confirmação de recebimento.
            </li>
            <li>
              Registro de consumo e segurança sem conteúdo das conversas; limites e autorização aplicados no servidor.
            </li>
            <li>Administração exclusiva da IT’s OK na primeira versão; nenhuma cobrança realizada no portal.</li>
          </ul>
        </details>
        <details>
          <summary>03 · Arquitetura de referência e responsabilidades</summary>
          <p>
            Hipótese para orçamento: portal e cadastros sob controle da IT’s OK; agentes configurados e hospedados no
            Foundry, acessados pelo backend. Confirmar a viabilidade da política de retenção antes de aprovar a
            arquitetura.
          </p>
          <ul>
            <li>
              Portal: identidade, permissões, interface, sessões, consumo e administração. Credenciais de provedores
              nunca expostas no navegador.
            </li>
            <li>
              Foundry ou serviço equivalente: execução dos agentes, instruções e base de conhecimento. Incluir o console
              de cadastro e conexão; edição das instruções e da base de conhecimento permanece fora do portal.
            </li>
            <li>
              IT’s OK: autoria, configuração, migração, curadoria e aprovação dos agentes e dos Manuais de Bordo, sob
              responsabilidade de seu especialista. Desenvolvedor: portal, infraestrutura, integração e suporte técnico à
              conexão. Não presumir contratação de criação metodológica ou RAG pelo fornecedor.
            </li>
            <li>
              Separação entre clientes obrigatória. Orçar e justificar isolamento lógico versus bases físicas separadas,
              incluindo documentos, índices e caches.
            </li>
            <li>
              Contas de infraestrutura e repositório sob controle da IT’s OK; entregar código, documentação e
              procedimentos de operação e migração.
            </li>
          </ul>
          <p>
            São duas modalidades de entrega: portal IT’s OK e soluções implantadas no tenant do cliente, eventualmente
            pelo Teams. O orçamento principal trata do portal; conexões entre tenants e acesso externo a ambientes de
            clientes exigem escopo e aprovação próprios.
          </p>
        </details>
        <details>
          <summary>04 · Sem histórico: o que precisa ser comprovado</summary>
          <p>
            Não manter transcrições no portal após o fim da sessão. Contexto temporário durante a conversa é necessário.
            Permanecem apenas dados cadastrais e metadados operacionais definidos para consumo e segurança.
          </p>
          <ul>
            <li>
              Definir encerramento explícito, expiração por inatividade, desconexão e troca de assistente. O descarte no
              servidor deve funcionar mesmo sem aviso de fechamento do navegador.
            </li>
            <li>
              Verificar persistência em logs, monitoramento, backups, filas, caches, threads e serviços externos. “Sem
              histórico no portal” não significa automaticamente “sem retenção pelo provedor”.
            </li>
            <li>
              O protótipo apaga a conversa ao encerrar, trocar de assistente, sair da tela ou após 30 minutos sem
              interação. Esse prazo é uma hipótese de demonstração.
            </li>
            <li>
              Aviso antes do descarte voluntário e possibilidade de copiar o resultado. A cópia realizada pelo usuário
              fica sob responsabilidade dele.
            </li>
          </ul>
        </details>
        <details>
          <summary>05 · Premissas para comparar propostas</summary>
          <p>
            Operação inicial pequena, ainda sem volume contratado confirmado. Para propostas comparáveis, sugerimos orçar
            um cenário de 10 usuários cadastrados e 2 conversas simultâneas, e informar o incremento para 50 usuários/5
            conversas simultâneas. São hipóteses de orçamento, não projeções comerciais.
          </p>
          <ul>
            <li>
              Separar horas e valores: design, frontend, backend, banco de dados, autenticação, console de agentes,
              Manual de Bordo, Fale conosco, integração, testes, implantação e documentação.
            </li>
            <li>
              Separar investimento inicial de despesas recorrentes: hospedagem, identidade, banco, monitoramento,
              serviços externos, consumo de IA e manutenção.
            </li>
            <li>Informar prazo por marco, responsabilidades, critérios de aceite, garantia e suporte.</li>
            <li>
              Definir a métrica da franquia e os limites. Sessões e mensagens são indicadores de uso; não equivalem
              diretamente a tokens ou custo.
            </li>
          </ul>
        </details>
        <details>
          <summary>06 · Fora do escopo inicial e opções separadas</summary>
          <p>
            Não incluir LMS, hospedagem de vídeos, trilhas, certificados, checkout ou cobrança. Orçar separadamente: SSO
            corporativo, painel de gestores de clientes, voz, anexos de usuários, exportação formatada, execução de
            HTML, múltiplos provedores e editor de instruções e base de conhecimento dentro do portal.
          </p>
        </details>
        <details>
          <summary>07 · Verificações essenciais para o aceite</summary>
          <ul>
            <li>Um cliente não acessa usuários, conteúdos ou recursos de outro.</li>
            <li>Usuário suspenso, contrato vencido e assistente não contratado são bloqueados no backend.</li>
            <li>O contexto funciona durante a sessão, e o descarte atende à política aprovada em toda a arquitetura.</li>
            <li>Consumo é atribuído à empresa, ao usuário e ao assistente corretos, sem transcrição.</li>
            <li>
              Autenticação, encerramento de sessão e controles contra abuso funcionam; a experiência em texto é
              utilizável em computador e celular.
            </li>
            <li>
              Um administrador autorizado inclui um sexto agente e o libera para uma empresa sem editar ou republicar
              código. A exclusividade é validada no servidor; credenciais não são expostas.
            </li>
            <li>
              O Manual de Bordo corresponde ao agente; o Fale conosco gera protocolo e encaminhamento sem anexar,
              registrar ou transmitir a conversa.
            </li>
          </ul>
        </details>
        <details>
          <summary>08 · Garantia e manutenção</summary>
          <p>
            Prever prazo de garantia corretiva e tratamento dos defeitos do escopo entregue. Após a garantia, cotar
            contratação de manutenção para incidentes, atualizações de segurança e compatibilidade, além de evoluções
            aprovadas separadamente.
          </p>
          <p>
            Definir responsáveis, canal, horários, criticidade, prazos de resposta e tratamento, acesso de suporte e
            documentação para transição a outro fornecedor. Atendimento ao usuário pela IT’s OK e manutenção técnica do
            portal são funções distintas.
          </p>
        </details>
        <details>
          <summary>09 · Identidade e decisões ainda abertas</summary>
          <p>
            Paleta e imagens preservadas do material fornecido pela IT’s OK. Fonte preferencial Manrope, com
            alternativas locais Segoe UI e Arial; nenhuma fonte externa é exigida por este arquivo. As imagens estão
            incorporadas. O protótipo não envia dados a serviços externos; um link de manual configurado pode abrir o
            endereço informado em outra aba.
          </p>
          <p>
            Confirmar: quantidade inicial de usuários; duração das licenças; franquia, alertas e bloqueios; autenticação
            e simultaneidade por conta; prazo de inatividade; política dos provedores; nomes definitivos dos
            assistentes; parâmetros da conexão; responsabilidades e prazos da manutenção técnica. A metodologia e a
            curadoria já são realizadas pela IT’s OK. As telas administrativas são uma proposta para discussão.
          </p>
        </details>
      </div>
    </section>
  );
}
