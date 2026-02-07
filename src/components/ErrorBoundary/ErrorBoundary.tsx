import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <Result
            status="error"
            title="Prišlo je do napake"
            subTitle="Oprostite, prišlo je do nepričakovane napake. Poskusite znova."
            extra={[
              <Button type="primary" key="home" onClick={this.handleReset}>
                Nazaj na domačo stran
              </Button>,
            ]}
          />
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className={styles.errorDetails}>
              <h3>Podrobnosti napake (samo v razvoju):</h3>
              <pre>{this.state.error.toString()}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
