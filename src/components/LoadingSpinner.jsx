import './LoadingSpinner.css'
const LoadingSpinner=()=>{
    return (
    <div className="ironman-loader-screen">
      <div className="arc-reactor">
        <div className="center-circle"></div>
        <div className="inner-ring"></div>
        <div className="middle-ring"></div>
        <div className="outer-ring"></div>
      </div>
      <h2 className="loading-text">Loading ...</h2>
    </div>
  );
}
export default LoadingSpinner;