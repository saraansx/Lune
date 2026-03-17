import React, { createContext, useContext, useMemo } from 'react';
import { SpotifyGqlApi } from '../../Plugin/gql/index';

interface ApiContextType {
    api: SpotifyGqlApi;
}

const ApiContext = createContext<ApiContextType | null>(null);

interface ApiProviderProps {
    accessToken: string;
    cookies: any[];
    onUnauthorized?: () => void;
    children: React.ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ accessToken, cookies, onUnauthorized, children }) => {
    const spDc = useMemo(() => cookies?.find((c: any) => c.name === 'sp_dc')?.value, [cookies]);
    const spT = useMemo(() => cookies?.find((c: any) => c.name === 'sp_t')?.value, [cookies]);
    const api = useMemo(() => new SpotifyGqlApi(accessToken, spDc, spT, onUnauthorized), [accessToken, spDc, spT, onUnauthorized]);

    return (
        <ApiContext.Provider value={{ api }}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = (): SpotifyGqlApi => {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context.api;
};
