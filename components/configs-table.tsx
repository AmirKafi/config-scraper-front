'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';

interface Config {
  id?: number;
  ping: number;
  config: string;
  channel: string;
  protocol: string;
  tested_at: string;
}

export function ConfigsTable() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConfigs = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/configs');
      if (!response.ok) {
        throw new Error('Failed to fetch configs');
      }
      const data = await response.json();
      setConfigs(data);
    } catch (error) {
      console.error('Failed to load configs:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllConfigs = () => {
    const allText = configs.map((c) => c.config).join('\n\n');
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPingStatus = (ping: number) => {
    if (ping < 50) return { label: 'Fast', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (ping < 100) return { label: 'Good', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { label: 'Slow', color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-lg bg-cyan-500/20 animate-pulse mx-auto"></div>
          <p className="text-muted-foreground">Loading configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-8 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Kernel Panic
              </h1>
              <p className="text-muted-foreground text-sm">
                {configs.length} configuration{configs.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadConfigs}
                disabled={refreshing}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                  refreshing
                    ? 'bg-cyan-500/20 text-cyan-400 cursor-wait'
                    : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                }`}
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={copyAllConfigs}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                  copiedAll
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                }`}
              >
                {copiedAll ? (
                  <>
                    <Check size={16} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 py-8 sm:px-8">
        <div className="max-w-7xl mx-auto">
          {configs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No configurations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-4 py-3 sm:px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Protocol
                    </th>
                    <th className="text-left px-4 py-3 sm:px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Ping
                    </th>
                    <th className="text-left px-4 py-3 sm:px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Configuration
                    </th>
                    <th className="text-left px-4 py-3 sm:px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Channel
                    </th>
                    <th className="text-left px-4 py-3 sm:px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Tested
                    </th>
                    <th className="text-center px-4 py-3 sm:px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((config, index) => {
                    const pingStatus = getPingStatus(config.ping);
                    return (
                      <tr
                        key={index}
                        className="border-b border-border hover:bg-secondary/30 transition-colors duration-150 group"
                      >
                        <td className="px-4 py-4 sm:px-6">
                          <span className="inline-block px-2.5 py-1 rounded text-xs font-medium bg-primary/20 text-primary">
                            {config.protocol}
                          </span>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${pingStatus.color}`}>
                              {config.ping}ms
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${pingStatus.bg} ${pingStatus.color}`}>
                              {pingStatus.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <code className="text-xs sm:text-sm text-muted-foreground break-all bg-secondary/50 px-2 py-1 rounded">
                            {config.config.substring(0, 40)}...
                          </code>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <span className="text-sm text-foreground">{config.channel}</span>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <span className="text-xs text-muted-foreground">{formatDate(config.tested_at)}</span>
                        </td>
                        <td className="px-4 py-4 sm:px-6 text-center">
                          <button
                            onClick={() => copyToClipboard(config.config, index)}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded transition-all duration-200 ${
                              copiedIndex === index
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/20'
                            }`}
                            title="Copy configuration"
                          >
                            {copiedIndex === index ? (
                              <Check size={16} />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t border-border px-6 py-8 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-secondary/50 rounded-lg px-6 py-4 border border-border">
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Total</p>
              <p className="text-2xl font-bold text-foreground">{configs.length}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg px-6 py-4 border border-border">
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Average Ping</p>
              <p className="text-2xl font-bold text-cyan-400">
                {configs.length > 0
                  ? Math.round(configs.reduce((sum, c) => sum + c.ping, 0) / configs.length)
                  : 0}
                ms
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg px-6 py-4 border border-border">
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Fast Configs</p>
              <p className="text-2xl font-bold text-emerald-400">
                {configs.filter((c) => c.ping < 100).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
