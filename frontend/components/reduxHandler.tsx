"use client"

import { store } from '@/store/store';
import { ReactNode } from 'react';
import { Provider } from 'react-redux'


export default function ProviderComponent(props: { children: ReactNode }) {
    return <Provider store={store}>{props.children}</Provider>
}