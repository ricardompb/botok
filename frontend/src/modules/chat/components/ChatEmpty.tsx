import botok from '../../../assets/botok.png';
import type { AgentPublicDto } from '../../catalog/dto/catalog.dto';

interface Props {
  agent: AgentPublicDto;
  hidden: boolean;
  onPrompt: (text: string) => void;
}

export function ChatEmpty({ agent, hidden, onPrompt }: Props) {
  return (
    <div id="chat-empty" className="chat-empty" hidden={hidden}>
      <img src={botok} className="bot-face" alt="BOTOK" />
      <span className="eyebrow" style={{ display: 'block', marginBottom: 12 }}>
        Vamos pensar juntos
      </span>
      <h1 id="chat-title">{agent.title}</h1>
      <p id="chat-description">{agent.intro}</p>
      <div className="prompt-grid" id="prompts">
        {agent.prompts.map((p, i) => (
          <button key={i} className="prompt" data-prompt={i} onClick={() => onPrompt(p)}>
            {p}
            <span>↗</span>
          </button>
        ))}
      </div>
      <p className="chat-tip" id="chat-tip">
        {agent.tip}
      </p>
    </div>
  );
}
