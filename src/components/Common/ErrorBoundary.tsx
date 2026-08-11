import Custom500 from '@/pages/500';
import type { ReactNode } from 'react';
import React, { Component } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state = {
    hasError: false,
  };

  render() {
    if (this.state.hasError) {
      return <Custom500 />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
