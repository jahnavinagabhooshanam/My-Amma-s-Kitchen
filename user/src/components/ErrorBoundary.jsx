import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Jost', sans-serif" }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>Oops! Something went wrong.</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>We're sorry, an unexpected error occurred.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: 'var(--primary-color)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
