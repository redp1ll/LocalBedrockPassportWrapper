/* src/passport-widget.tsx */

import React from 'react';
import * as ReactDOMClient from 'react-dom/client'; // React 18 "createRoot"
import {
  BedrockPassportProvider,
  LoginPanel,
  useBedrockPassport
} from '@bedrock_org/passport';
import '@bedrock_org/passport/dist/style.css';

// -------------- TYPES --------------
interface BedrockInitOptions {
  target: string;          // e.g. '#login-widget'
  tenantId: string;        // e.g. 'orange-vibe'
  callbackUrl: string;     // e.g. 'https://your-domain.com/auth/callback'
  baseUrl?: string;        // default 'https://api.bedrockpassport.com'
  walletConnectId?: string;
  showWalletConnect?: boolean;
  styling?: {
    title?: string;
    logoUrl?: string;
    logoAlt?: string;
    panelClass?: string;
    buttonClass?: string;
    headerClass?: string;
    titleClass?: string;
    logoClass?: string;
    walletButtonText?: string;
    walletButtonClass?: string;
    separatorText?: string;
    separatorTextClass?: string;
    separatorClass?: string;
  };
  onLogin?: (user: any) => void;
  onError?: (err: any) => void;
}

declare global {
  interface Window {
    BedrockPassport?: {
      init: (options: BedrockInitOptions) => void;
    };
  }
}

// -------------- DEFINE GLOBAL --------------
// We define a placeholder for window.BedrockPassport immediately.
window.BedrockPassport = {
  init: (options: BedrockInitOptions) => {
    console.log('BedrockPassport: init called before script fully loaded', options);
  },
};

// -------------- RENDER FUNCTION --------------
function renderWidget(options: BedrockInitOptions) {
  // Validate required fields
  if (!options.target) throw new Error("BedrockPassport: 'target' is required");
  if (!options.tenantId) throw new Error("BedrockPassport: 'tenantId' is required");
  if (!options.callbackUrl) throw new Error("BedrockPassport: 'callbackUrl' is required");

  const container = document.querySelector(options.target);
  if (!container) {
    throw new Error(`BedrockPassport: Target element "${options.target}" not found`);
  }

  // Create React 18 root
  const root = ReactDOMClient.createRoot(container as HTMLElement);

  // Simple wrapper that uses the official hook
  function WidgetWrapper() {
    const bedrockPassport = useBedrockPassport();

    // onLogin callback
    React.useEffect(() => {
      if (bedrockPassport.user && options.onLogin) {
        options.onLogin(bedrockPassport.user);
      }
    }, [bedrockPassport.user]);

    // Build <LoginPanel> props from styling
    const loginPanelProps = {
      title: options.styling?.title || 'Sign in to',
      logo: options.styling?.logoUrl,
      logoAlt: options.styling?.logoAlt || 'Bedrock Passport',
      panelClass: options.styling?.panelClass || 'container p-2 md:p-8 rounded-2xl max-w-[480px]',
      buttonClass: options.styling?.buttonClass || 'hover:border-blue-500',
      headerClass: options.styling?.headerClass || 'justify-center',
      titleClass: options.styling?.titleClass || 'text-xl font-bold',
      logoClass: options.styling?.logoClass || 'ml-2 md:h-8 h-6',
      showConnectWallet: options.showWalletConnect ?? true,
      walletButtonText: options.styling?.walletButtonText || 'Connect Wallet',
      walletButtonClass: options.styling?.walletButtonClass,
      separatorText: options.styling?.separatorText || 'OR',
      separatorTextClass: options.styling?.separatorTextClass || 'bg-blue-900 text-gray-500',
      separatorClass: options.styling?.separatorClass || 'bg-blue-900',
    };

    return <LoginPanel {...loginPanelProps} />;
  }

  // Render with <BedrockPassportProvider>
  root.render(
    <BedrockPassportProvider
      baseUrl={options.baseUrl || 'https://api.bedrockpassport.com'}
      authCallbackUrl={options.callbackUrl}
      tenantId={options.tenantId}
      walletConnectId={options.walletConnectId}
    >
      <WidgetWrapper />
    </BedrockPassportProvider>
  );

  console.log(`BedrockPassport: Widget initialized in ${options.target}`);
}

// -------------- OVERRIDE INIT --------------
window.BedrockPassport.init = (options: BedrockInitOptions) => {
  try {
    renderWidget(options);
  } catch (err) {
    console.error('BedrockPassport: Error initializing widget', err);
    if (options.onError) options.onError(err);
  }
};

console.log('BedrockPassport: Single-file script loaded. Call BedrockPassport.init({...}) to begin.');
