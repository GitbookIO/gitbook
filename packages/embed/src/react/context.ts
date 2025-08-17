'use client';

import * as React from 'react';
import type { GitBookClient } from '../client';

export const GitBookContext = React.createContext<GitBookClient | null>(null);
