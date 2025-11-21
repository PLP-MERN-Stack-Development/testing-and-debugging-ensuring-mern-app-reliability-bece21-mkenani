// client/src/components/ErrorBoundary.jsx - Error boundary for React debugging

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Error occurred: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

