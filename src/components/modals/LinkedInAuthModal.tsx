import React, { useState, useEffect } from 'react';
import {
  Linkedin,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Copy,
  Check,
  ArrowRight,
  Info,
  LogOut,
} from 'lucide-react';
import { CandidateProfile, LinkedInAuthProfile } from '../../types';
import {
  fetchLinkedInConfig,
  fetchLinkedInAuthStatus,
  initiateLinkedInOAuthFlow,
  syncDirectLinkedInToken,
  disconnectLinkedInAuth,
  LinkedInAuthConfig,
} from '../../services/linkedinAuth';

interface LinkedInAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateProfile: CandidateProfile;
  onProfileUpdated: (updatedProfile: CandidateProfile) => void;
  onShowToast: (msg: string) => void;
}

export const LinkedInAuthModal: React.FC<LinkedInAuthModalProps> = ({
  isOpen,
  onClose,
  candidateProfile,
  onProfileUpdated,
  onShowToast,
}) => {
  const [config, setConfig] = useState<LinkedInAuthConfig | null>(null);
  const [authProfile, setAuthProfile] = useState<LinkedInAuthProfile | null>(
    candidateProfile.linkedInAuth || null
  );
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [isSyncingToken, setIsSyncingToken] = useState(false);
  const [showManualSection, setShowManualSection] = useState(false);

  // Load config & live status from backend on open
  useEffect(() => {
    if (!isOpen) return;

    fetchLinkedInConfig().then((cfg) => setConfig(cfg));
    fetchLinkedInAuthStatus().then((res) => {
      if (res.authenticated && res.profile) {
        setAuthProfile(res.profile);
      }
    });
  }, [isOpen]);

  // Listen for postMessage from OAuth popup callback
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      // Allow messages from the same window origin or container preview host
      const origin = event.origin;
      const isAllowedOrigin =
        origin === window.location.origin ||
        origin.endsWith('.run.app') ||
        origin.includes('localhost');

      if (!isAllowedOrigin) return;

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const receivedProfile = event.data.profile as LinkedInAuthProfile;
        setIsAuthenticating(false);
        setErrorMessage(null);
        setAuthProfile(receivedProfile);

        // Ingest into CandidateProfile
        const updated: CandidateProfile = {
          ...candidateProfile,
          name: receivedProfile.name || candidateProfile.name,
          email: receivedProfile.email || candidateProfile.email,
          avatarUrl: receivedProfile.picture || candidateProfile.avatarUrl,
          linkedInAuth: receivedProfile,
        };

        onProfileUpdated(updated);
        onShowToast(`LinkedIn identity verified: ${receivedProfile.name}`);
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setIsAuthenticating(false);
        setErrorMessage(event.data.error || 'LinkedIn authentication was cancelled or encountered an error.');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, candidateProfile, onProfileUpdated, onShowToast]);

  if (!isOpen) return null;

  // Action: Launch real OAuth popup flow
  const handleConnectOAuth = async () => {
    setErrorMessage(null);
    setIsAuthenticating(true);

    const result = await initiateLinkedInOAuthFlow();

    if (result.error) {
      setIsAuthenticating(false);
      setErrorMessage(result.error);
      return;
    }

    if (!result.popup) {
      setIsAuthenticating(false);
      setErrorMessage(
        'Popup was blocked by your browser. Please allow popups for this window and try connecting again.'
      );
    }
  };

  // Action: Direct token synchronization
  const handleSyncManualToken = async () => {
    if (!manualToken.trim()) {
      setErrorMessage('Please provide a valid LinkedIn access token.');
      return;
    }

    setIsSyncingToken(true);
    setErrorMessage(null);

    const res = await syncDirectLinkedInToken(manualToken.trim());
    setIsSyncingToken(false);

    if (res.success && res.profile) {
      setAuthProfile(res.profile);
      const updated: CandidateProfile = {
        ...candidateProfile,
        name: res.profile.name || candidateProfile.name,
        email: res.profile.email || candidateProfile.email,
        avatarUrl: res.profile.picture || candidateProfile.avatarUrl,
        linkedInAuth: res.profile,
      };
      onProfileUpdated(updated);
      setManualToken('');
      setShowManualSection(false);
      onShowToast(`LinkedIn profile synced for ${res.profile.name}`);
    } else {
      setErrorMessage(res.error || 'Failed to authenticate token with LinkedIn API.');
    }
  };

  // Action: Disconnect
  const handleDisconnect = async () => {
    await disconnectLinkedInAuth();
    setAuthProfile(null);
    const updated: CandidateProfile = {
      ...candidateProfile,
      linkedInAuth: undefined,
    };
    onProfileUpdated(updated);
    onShowToast('LinkedIn session disconnected.');
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const currentRedirectUri =
    config?.redirectUri || `${window.location.origin}/auth/callback`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#1c1917] border border-[#524535]/35 rounded-2xl shadow-2xl overflow-hidden text-[#F8F9FA] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#524535]/25 bg-[#201f20]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0077b5]/20 border border-[#0077b5]/40 flex items-center justify-center text-[#0077b5]">
              <Linkedin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#F8F9FA] flex items-center gap-2">
                <span>LinkedIn Identity &amp; Data Integration</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ffd7a9]/10 text-[#ffd7a9] border border-[#ffd7a9]/20">
                  REAL OAUTH 2.0
                </span>
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                Synchronize authentic profile records directly from LinkedIn OpenID Connect API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#F8F9FA] hover:bg-[#2a2a2b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Status Panel */}
          {authProfile ? (
            <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {authProfile.picture ? (
                    <img
                      src={authProfile.picture}
                      alt={authProfile.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full border-2 border-[#22C55E] object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center font-bold text-base">
                      {authProfile.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#F8F9FA]">{authProfile.name}</h3>
                      <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/20 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        LIVE AUTHENTICATED
                      </span>
                    </div>
                    <p className="text-[#A1A1AA] font-mono text-[11px]">{authProfile.email || 'No email reported'}</p>
                    <p className="text-[10px] text-[#ffd7a9] font-mono mt-0.5">
                      Member ID: {authProfile.sub} · Verified via OpenID Connect
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#2a2a2b] hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[#22C55E]/20 flex flex-wrap items-center justify-between text-[11px] text-[#A1A1AA]">
                <span>Connected: {new Date(authProfile.connectedAt).toLocaleDateString()} {new Date(authProfile.connectedAt).toLocaleTimeString()}</span>
                <span className="text-[#22C55E] font-medium">Candidate truth layer synchronized</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#201f20] border border-[#524535]/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#ffd7a9]" />
                  <span className="font-semibold text-[#F8F9FA] text-sm">Authentication Status:</span>
                  <span className="font-mono text-[#ffd7a9] bg-[#ffd7a9]/10 px-2 py-0.5 rounded text-[11px]">
                    NOT AUTHENTICATED
                  </span>
                </div>
                <span className="text-[11px] text-[#A1A1AA]">
                  Fallback: Verified Candidate Brain Data
                </span>
              </div>
              <p className="text-[#A1A1AA] text-xs leading-relaxed">
                Connect your LinkedIn account via official OAuth 2.0 to dynamically fetch your real
                identity, verify profile claims, and synchronize truth records.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-xs block">Connection Notice</span>
                <p className="text-[11px] leading-relaxed text-[#FCA5A5]">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="space-y-3">
            <button
              id="btn-linkedin-oauth-connect"
              onClick={handleConnectOAuth}
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#0077b5] hover:bg-[#006097] text-white font-medium text-xs transition-all shadow-lg hover:shadow-[#0077b5]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Waiting for LinkedIn authorization in popup...</span>
                </>
              ) : (
                <>
                  <Linkedin className="w-4 h-4" />
                  <span>{authProfile ? 'Re-Authenticate with LinkedIn' : 'Sign in with LinkedIn (OAuth 2.0)'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-[#A1A1AA]">
              Opens LinkedIn's secure login directly in an external popup per AI Studio preview guidelines.
            </p>
          </div>

          {/* Setup / Configuration Guidance */}
          <div className="p-4 rounded-xl bg-[#201f20] border border-[#524535]/25 space-y-3">
            <div className="flex items-center gap-2 text-[#ffd7a9] font-medium">
              <Info className="w-4 h-4 shrink-0" />
              <span className="text-xs uppercase tracking-wider font-bold">
                OAuth Provider Configuration Details
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
              To authenticate with your own LinkedIn Developer App, add these exact redirect URLs to your
              LinkedIn Developer Portal (under <strong>Auth &gt; OAuth 2.0 settings</strong>):
            </p>

            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-[#141415] border border-[#524535]/30 flex items-center justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] text-[#ffd7a9] font-mono block">Callback URL (Active Container):</span>
                  <code className="text-[11px] text-[#F8F9FA] font-mono truncate block">
                    {currentRedirectUri}
                  </code>
                </div>
                <button
                  onClick={() => copyToClipboard(currentRedirectUri, 'callback')}
                  className="px-2.5 py-1 rounded bg-[#2a2a2b] hover:bg-[#353436] text-[10px] font-mono text-[#ffd7a9] flex items-center gap-1 shrink-0"
                >
                  {copiedField === 'callback' ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'callback' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {config?.suggestedSharedRedirectUri && config.suggestedSharedRedirectUri !== currentRedirectUri && (
                <div className="p-2.5 rounded-lg bg-[#141415] border border-[#524535]/30 flex items-center justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] text-[#ffd7a9] font-mono block">Shared / Production Callback URL:</span>
                    <code className="text-[11px] text-[#F8F9FA] font-mono truncate block">
                      {config.suggestedSharedRedirectUri}
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(config.suggestedSharedRedirectUri, 'sharedCallback')}
                    className="px-2.5 py-1 rounded bg-[#2a2a2b] hover:bg-[#353436] text-[10px] font-mono text-[#ffd7a9] flex items-center gap-1 shrink-0"
                  >
                    {copiedField === 'sharedCallback' ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'sharedCallback' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#524535]/20 grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-[#141415]">
                <span className="text-[#A1A1AA] block text-[10px]">Client ID Status:</span>
                <span className={`font-mono font-bold ${config?.clientIdConfigured ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  {config?.clientIdConfigured ? 'CONFIGURED' : 'MISSING (LINKEDIN_CLIENT_ID)'}
                </span>
              </div>
              <div className="p-2 rounded bg-[#141415]">
                <span className="text-[#A1A1AA] block text-[10px]">Client Secret Status:</span>
                <span className={`font-mono font-bold ${config?.hasClientSecret ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  {config?.hasClientSecret ? 'CONFIGURED' : 'MISSING (LINKEDIN_CLIENT_SECRET)'}
                </span>
              </div>
            </div>
          </div>

          {/* Developer / Direct Token Test Section */}
          <div className="pt-1">
            <button
              onClick={() => setShowManualSection(!showManualSection)}
              className="text-[11px] text-[#ffd7a9] hover:underline flex items-center gap-1 font-mono"
            >
              <span>{showManualSection ? '▲ Hide Direct Token Synchronization' : '▼ Direct LinkedIn Access Token Sync (Developer Portal)'}</span>
            </button>

            {showManualSection && (
              <div className="mt-2 p-3.5 rounded-xl bg-[#201f20] border border-[#524535]/25 space-y-2.5">
                <p className="text-[11px] text-[#A1A1AA]">
                  Have an active LinkedIn User Token from the LinkedIn Developer API Inspector or OAuth Playground?
                  Paste it here to query <code>api.linkedin.com/v2/userinfo</code> live:
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="AQV... (Bearer Access Token)"
                    className="flex-1 bg-[#141415] border border-[#524535]/40 rounded-lg px-3 py-1.5 text-xs font-mono text-[#F8F9FA] focus:outline-none focus:border-[#ffd7a9]"
                  />
                  <button
                    onClick={handleSyncManualToken}
                    disabled={isSyncingToken}
                    className="px-3 py-1.5 bg-[#ffd7a9] text-[#462a00] font-semibold rounded-lg hover:bg-[#ffe3c2] text-xs transition-colors shrink-0 disabled:opacity-50"
                  >
                    {isSyncingToken ? 'Querying API...' : 'Fetch Live Profile'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#524535]/25 bg-[#201f20] flex items-center justify-between text-xs text-[#A1A1AA]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>Secure Server Proxy · Tokens Never Leaked to Browser Client</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#2a2a2b] hover:bg-[#353436] text-[#F8F9FA] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
