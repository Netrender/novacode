import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('NovaCode IDE ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', color: '#f8fafc', background: '#090d16', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', border: '1px solid #334155', borderRadius: '8px', margin: '8px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
          <h2 style={{ fontSize: '18px', color: '#ef4444', marginBottom: '10px' }}>Сработала защита от сбоя (Error Boundary)</h2>
          <p style={{ color: '#94a3b8', maxWidth: '480px', marginBottom: '16px', fontSize: '13px', lineHeight: '1.5' }}>
            При отображении этого компонента произошла ошибка. Вся остальная часть IDE продолжает работать в безопасном режиме.
            <br />
            <code style={{ color: '#fbbf24', background: '#1e293b', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '8px', wordBreak: 'break-all' }}>
              {this.state.error?.message || 'Неизвестная ошибка рендеринга'}
            </code>
          </p>
          <button
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            🔄 Перезапустить блок
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
