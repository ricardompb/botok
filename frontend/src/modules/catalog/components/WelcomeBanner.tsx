import botok from '../../../assets/botok.png';

export function WelcomeBanner({ firstName }: { firstName: string }) {
  return (
    <div className="welcome">
      <div>
        <span className="eyebrow">Olá, {firstName}.</span>
        <h1>
          Uma boa conversa começa
          <br />
          antes da primeira palavra.
        </h1>
        <p>
          Qual é o seu desafio de comunicação hoje? Escolha um assistente e encontre apoio para preparar o
          próximo passo.
        </p>
      </div>
      <img src={botok} alt="BOTOK acenando" />
    </div>
  );
}
