import './Ticker.css';

const Ticker = () => {
  const tickerText = "Ynuka Labs • Innovation Technologique en RDC Nord-Kivu • Blockchain pour le Futur • Développement Durable • Rejoignez la Révolution Numérique • ";
  
  return (
    <div className="ticker-container">
      <div className="ticker-content">
        <span className="ticker-text">{tickerText.repeat(10)}</span>
      </div>
    </div>
  );
};

export default Ticker;
