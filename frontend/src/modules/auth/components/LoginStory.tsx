import botok from '../../../assets/botok.png';
import fullLogo from '../../../assets/logo-itsok-full.png';

export function LoginStory() {
  return (
    <div className="login-story">
      <div>
        <img className="full-logo" src={fullLogo} alt="IT’s OK — comunicação para líderes" />
        <h1>
          Todo profissional
          <br />
          tem o direito de ser
          <br />
          <span>compreendido.</span>
        </h1>
        <p>A metodologia da IT’s OK ao seu lado, quando a comunicação precisa fazer a diferença.</p>
      </div>
      <div className="story-bottom">
        <img src={botok} alt="BOTOK, o assistente da IT’s OK" />
        <div>
          <b>Conheça o BOTOK.</b>
          <br />
          Assistentes para pensar a abordagem, preparar a mensagem e comunicar com mais clareza.
        </div>
      </div>
    </div>
  );
}
