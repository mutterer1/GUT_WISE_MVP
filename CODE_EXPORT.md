# Complete Code Export for External Review

This document contains a complete export of all source code from the project.

---

## ./eslint.config.js

```
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
);

```

## ./package-lock.json

```
{
  "name": "vite-react-typescript-starter",
  "version": "0.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "vite-react-typescript-starter",
      "version": "0.0.0",
      "dependencies": {
        "@supabase/supabase-js": "^2.57.4",
        "lucide-react": "^0.344.0",
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "react-router-dom": "^7.13.2"
      },
      "devDependencies": {
        "@eslint/js": "^9.9.1",
        "@types/react": "^18.3.5",
        "@types/react-dom": "^18.3.0",
        "@vitejs/plugin-react": "^4.3.1",
        "autoprefixer": "^10.4.18",
        "eslint": "^9.9.1",
        "eslint-plugin-react-hooks": "^5.1.0-rc.0",
        "eslint-plugin-react-refresh": "^0.4.11",
        "globals": "^15.9.0",
        "postcss": "^8.4.35",
        "tailwindcss": "^3.4.1",
        "typescript": "^5.5.3",
        "typescript-eslint": "^8.3.0",
        "vite": "^5.4.2"
      }
    },
    "node_modules/@alloc/quick-lru": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/@alloc/quick-lru/-/quick-lru-5.2.0.tgz",
      "integrity": "sha512-UrcABB+4bUrFABwbluTIBErXwvbsU/V7TZWfmbgJfbkwiBuziS9gxdODUyuiecfdGQ85jglMW6juS3+z5TsKLw==",
      "dev": true,
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/@ampproject/remapping": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/@ampproject/remapping/-/remapping-2.3.0.tgz",
      "integrity": "sha512-30iZtAPgz+LTIYoeivqYo853f02jBYSd5uGnGpkFV0M3xOt9aN73erkgYAmZU43x4VfqcnLxW9Kpg3R5LC4YYw==",
      "dev": true,
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@babel/code-frame": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.25.7.tgz",
      "integrity": "sha512-0xZJFNE5XMpENsgfHYTw8FbX4kv53mFLn2i3XPoq69LyhYSCBJtitaHx9QnsVTrsogI4Z3+HtEfZ2/GFPOtf5g==",
      "dev": true,
      "dependencies": {
        "@babel/highlight": "^7.25.7",
        "picocolors": "^1.0.0"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/compat-data": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/compat-data/-/compat-data-7.25.7.tgz",
      "integrity": "sha512-9ickoLz+hcXCeh7jrcin+/SLWm+GkxE2kTvoYyp38p4WkdFXfQJxDFGWp/YHjiKLPx06z2A7W8XKuqbReXDzsw==",
      "dev": true,
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/core": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/core/-/core-7.25.7.tgz",
      "integrity": "sha512-yJ474Zv3cwiSOO9nXJuqzvwEeM+chDuQ8GJirw+pZ91sCGCyOZ3dJkVE09fTV0VEVzXyLWhh3G/AolYTPX7Mow==",
      "dev": true,
      "dependencies": {
        "@ampproject/remapping": "^2.2.0",
        "@babel/code-frame": "^7.25.7",
        "@babel/generator": "^7.25.7",
        "@babel/helper-compilation-targets": "^7.25.7",
        "@babel/helper-module-transforms": "^7.25.7",
        "@babel/helpers": "^7.25.7",
        "@babel/parser": "^7.25.7",
        "@babel/template": "^7.25.7",
        "@babel/traverse": "^7.25.7",
        "@babel/types": "^7.25.7",
        "convert-source-map": "^2.0.0",
        "debug": "^4.1.0",
        "gensync": "^1.0.0-beta.2",
        "json5": "^2.2.3",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/babel"
      }
    },
    "node_modules/@babel/generator": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/generator/-/generator-7.25.7.tgz",
      "integrity": "sha512-5Dqpl5fyV9pIAD62yK9P7fcA768uVPUyrQmqpqstHWgMma4feF1x/oFysBCVZLY5wJ2GkMUCdsNDnGZrPoR6rA==",
      "dev": true,
      "dependencies": {
        "@babel/types": "^7.25.7",
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.25",
        "jsesc": "^3.0.2"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-compilation-targets": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.25.7.tgz",
      "integrity": "sha512-DniTEax0sv6isaw6qSQSfV4gVRNtw2rte8HHM45t9ZR0xILaufBRNkpMifCRiAPyvL4ACD6v0gfCwCmtOQaV4A==",
      "dev": true,
      "dependencies": {
        "@babel/compat-data": "^7.25.7",
        "@babel/helper-validator-option": "^7.25.7",
        "browserslist": "^4.24.0",
        "lru-cache": "^5.1.1",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-imports": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-imports/-/helper-module-imports-7.25.7.tgz",
      "integrity": "sha512-o0xCgpNmRohmnoWKQ0Ij8IdddjyBFE4T2kagL/x6M3+4zUgc+4qTOUBoNe4XxDskt1HPKO007ZPiMgLDq2s7Kw==",
      "dev": true,
      "dependencies": {
        "@babel/traverse": "^7.25.7",
        "@babel/types": "^7.25.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-transforms": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-transforms/-/helper-module-transforms-7.25.7.tgz",
      "integrity": "sha512-k/6f8dKG3yDz/qCwSM+RKovjMix563SLxQFo0UhRNo239SP6n9u5/eLtKD6EAjwta2JHJ49CsD8pms2HdNiMMQ==",
      "dev": true,
      "dependencies": {
        "@babel/helper-module-imports": "^7.25.7",
        "@babel/helper-simple-access": "^7.25.7",
        "@babel/helper-validator-identifier": "^7.25.7",
        "@babel/traverse": "^7.25.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-plugin-utils": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-plugin-utils/-/helper-plugin-utils-7.25.7.tgz",
      "integrity": "sha512-eaPZai0PiqCi09pPs3pAFfl/zYgGaE6IdXtYvmf0qlcDTd3WCtO7JWCcRd64e0EQrcYgiHibEZnOGsSY4QSgaw==",
      "dev": true,
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-simple-access": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-simple-access/-/helper-simple-access-7.25.7.tgz",
      "integrity": "sha512-FPGAkJmyoChQeM+ruBGIDyrT2tKfZJO8NcxdC+CWNJi7N8/rZpSxK7yvBJ5O/nF1gfu5KzN7VKG3YVSLFfRSxQ==",
      "dev": true,
      "dependencies": {
        "@babel/traverse": "^7.25.7",
        "@babel/types": "^7.25.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-string-parser": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-string-parser/-/helper-string-parser-7.25.7.tgz",
      "integrity": "sha512-CbkjYdsJNHFk8uqpEkpCvRs3YRp9tY6FmFY7wLMSYuGYkrdUi7r2lc4/wqsvlHoMznX3WJ9IP8giGPq68T/Y6g==",
      "dev": true,
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-identifier": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.25.7.tgz",
      "integrity": "sha512-AM6TzwYqGChO45oiuPqwL2t20/HdMC1rTPAesnBCgPCSF1x3oN9MVUwQV2iyz4xqWrctwK5RNC8LV22kaQCNYg==",
      "dev": true,
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-option": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-option/-/helper-validator-option-7.25.7.tgz",
      "integrity": "sha512-ytbPLsm+GjArDYXJ8Ydr1c/KJuutjF2besPNbIZnZ6MKUxi/uTA22t2ymmA4WFjZFpjiAMO0xuuJPqK2nvDVfQ==",
      "dev": true,
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helpers": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/helpers/-/helpers-7.25.7.tgz",
      "integrity": "sha512-Sv6pASx7Esm38KQpF/U/OXLwPPrdGHNKoeblRxgZRLXnAtnkEe4ptJPDtAZM7fBLadbc1Q07kQpSiGQ0Jg6tRA==",
      "dev": true,
      "dependencies": {
        "@babel/template": "^7.25.7",
        "@babel/types": "^7.25.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/highlight": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/highlight/-/highlight-7.25.7.tgz",
      "integrity": "sha512-iYyACpW3iW8Fw+ZybQK+drQre+ns/tKpXbNESfrhNnPLIklLbXr7MYJ6gPEd0iETGLOK+SxMjVvKb/ffmk+FEw==",
      "dev": true,
      "dependencies": {
        "@babel/helper-validator-identifier": "^7.25.7",
        "chalk": "^2.4.2",
        "js-tokens": "^4.0.0",
        "picocolors": "^1.0.0"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/parser": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/parser/-/parser-7.25.7.tgz",
      "integrity": "sha512-aZn7ETtQsjjGG5HruveUK06cU3Hljuhd9Iojm4M8WWv3wLE6OkE5PWbDUkItmMgegmccaITudyuW5RPYrYlgWw==",
      "dev": true,
      "dependencies": {
        "@babel/types": "^7.25.7"
      },
      "bin": {
        "parser": "bin/babel-parser.js"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx-self": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-self/-/plugin-transform-react-jsx-self-7.25.7.tgz",
      "integrity": "sha512-JD9MUnLbPL0WdVK8AWC7F7tTG2OS6u/AKKnsK+NdRhUiVdnzyR1S3kKQCaRLOiaULvUiqK6Z4JQE635VgtCFeg==",
      "dev": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.25.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx-source": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-source/-/plugin-transform-react-jsx-source-7.25.7.tgz",
      "integrity": "sha512-S/JXG/KrbIY06iyJPKfxr0qRxnhNOdkNXYBl/rmwgDd72cQLH9tEGkDm/yJPGvcSIUoikzfjMios9i+xT/uv9w==",
      "dev": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.25.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/template": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/template/-/template-7.25.7.tgz",
      "integrity": "sha512-wRwtAgI3bAS+JGU2upWNL9lSlDcRCqD05BZ1n3X2ONLH1WilFP6O1otQjeMK/1g0pvYcXC7b/qVUB1keofjtZA==",
      "dev": true,
      "dependencies": {
        "@babel/code-frame": "^7.25.7",
        "@babel/parser": "^7.25.7",
        "@babel/types": "^7.25.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/traverse": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/traverse/-/traverse-7.25.7.tgz",
      "integrity": "sha512-jatJPT1Zjqvh/1FyJs6qAHL+Dzb7sTb+xr7Q+gM1b+1oBsMsQQ4FkVKb6dFlJvLlVssqkRzV05Jzervt9yhnzg==",
      "dev": true,
      "dependencies": {
        "@babel/code-frame": "^7.25.7",
        "@babel/generator": "^7.25.7",
        "@babel/parser": "^7.25.7",
        "@babel/template": "^7.25.7",
        "@babel/types": "^7.25.7",
        "debug": "^4.3.1",
        "globals": "^11.1.0"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/traverse/node_modules/globals": {
      "version": "11.12.0",
      "resolved": "https://registry.npmjs.org/globals/-/globals-11.12.0.tgz",
      "integrity": "sha512-WOBp/EEGUiIsJSp7wcv/y6MO+lV9UoncWqxuFfm8eBwzWNgyfBd6Gz+IeKQ9jCmyhoH99g15M3T+QaVHFjizVA==",
      "dev": true,
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/@babel/types": {
      "version": "7.25.7",
      "resolved": "https://registry.npmjs.org/@babel/types/-/types-7.25.7.tgz",
      "integrity": "sha512-vwIVdXG+j+FOpkwqHRcBgHLYNL7XMkufrlaFvL9o6Ai9sJn9+PdyIL5qa0XzTZw084c+u9LOls53eoZWP/W5WQ==",
      "dev": true,
      "dependencies": {
        "@babel/helper-string-parser": "^7.25.7",
        "@babel/helper-validator-identifier": "^7.25.7",
        "to-fast-properties": "^2.0.0"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@esbuild/aix-ppc64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.21.5.tgz",
      "integrity": "sha512-1SDgH6ZSPTlggy1yI6+Dbkiz8xzpHJEVAlF/AM1tHPLsf5STom9rwtjE4hKAF20FfXXNTFqEYXyJNWh1GiZedQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/android-arm": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.21.5.tgz",
      "integrity": "sha512-vCPvzSjpPHEi1siZdlvAlsPxXl7WbOVUBBAowWug4rJHb68Ox8KualB+1ocNvT5fjv6wpkX6o/iEpbDrf68zcg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/android-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.21.5.tgz",
      "integrity": "sha512-c0uX9VAUBQ7dTDCjq+wdyGLowMdtR/GoC2U5IYk/7D1H1JYC0qseD7+11iMP2mRLN9RcCMRcjC4YMclCzGwS/A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/android-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.21.5.tgz",
      "integrity": "sha512-D7aPRUUNHRBwHxzxRvp856rjUHRFW1SdQATKXH2hqA0kAZb1hKmi02OpYRacl0TxIGz/ZmXWlbZgjwWYaCakTA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/darwin-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.21.5.tgz",
      "integrity": "sha512-DwqXqZyuk5AiWWf3UfLiRDJ5EDd49zg6O9wclZ7kUMv2WRFr4HKjXp/5t8JZ11QbQfUS6/cRCKGwYhtNAY88kQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/darwin-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.21.5.tgz",
      "integrity": "sha512-se/JjF8NlmKVG4kNIuyWMV/22ZaerB+qaSi5MdrXtd6R08kvs2qCN4C09miupktDitvh8jRFflwGFBQcxZRjbw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/freebsd-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.21.5.tgz",
      "integrity": "sha512-5JcRxxRDUJLX8JXp/wcBCy3pENnCgBR9bN6JsY4OmhfUtIHe3ZW0mawA7+RDAcMLrMIZaf03NlQiX9DGyB8h4g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/freebsd-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.21.5.tgz",
      "integrity": "sha512-J95kNBj1zkbMXtHVH29bBriQygMXqoVQOQYA+ISs0/2l3T9/kj42ow2mpqerRBxDJnmkUDCaQT/dfNXWX/ZZCQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-arm": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.21.5.tgz",
      "integrity": "sha512-bPb5AHZtbeNGjCKVZ9UGqGwo8EUu4cLq68E95A53KlxAPRmUyYv2D6F0uUI65XisGOL1hBP5mTronbgo+0bFcA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.21.5.tgz",
      "integrity": "sha512-ibKvmyYzKsBeX8d8I7MH/TMfWDXBF3db4qM6sy+7re0YXya+K1cem3on9XgdT2EQGMu4hQyZhan7TeQ8XkGp4Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-ia32": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.21.5.tgz",
      "integrity": "sha512-YvjXDqLRqPDl2dvRODYmmhz4rPeVKYvppfGYKSNGdyZkA01046pLWyRKKI3ax8fbJoK5QbxblURkwK/MWY18Tg==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-loong64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.21.5.tgz",
      "integrity": "sha512-uHf1BmMG8qEvzdrzAqg2SIG/02+4/DHB6a9Kbya0XDvwDEKCoC8ZRWI5JJvNdUjtciBGFQ5PuBlpEOXQj+JQSg==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-mips64el": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.21.5.tgz",
      "integrity": "sha512-IajOmO+KJK23bj52dFSNCMsz1QP1DqM6cwLUv3W1QwyxkyIWecfafnI555fvSGqEKwjMXVLokcV5ygHW5b3Jbg==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-ppc64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.21.5.tgz",
      "integrity": "sha512-1hHV/Z4OEfMwpLO8rp7CvlhBDnjsC3CttJXIhBi+5Aj5r+MBvy4egg7wCbe//hSsT+RvDAG7s81tAvpL2XAE4w==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-riscv64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.21.5.tgz",
      "integrity": "sha512-2HdXDMd9GMgTGrPWnJzP2ALSokE/0O5HhTUvWIbD3YdjME8JwvSCnNGBnTThKGEB91OZhzrJ4qIIxk/SBmyDDA==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-s390x": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.21.5.tgz",
      "integrity": "sha512-zus5sxzqBJD3eXxwvjN1yQkRepANgxE9lgOW2qLnmr8ikMTphkjgXu1HR01K4FJg8h1kEEDAqDcZQtbrRnB41A==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.21.5.tgz",
      "integrity": "sha512-1rYdTpyv03iycF1+BhzrzQJCdOuAOtaqHTWJZCWvijKD2N5Xu0TtVC8/+1faWqcP9iBCWOmjmhoH94dH82BxPQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/netbsd-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.21.5.tgz",
      "integrity": "sha512-Woi2MXzXjMULccIwMnLciyZH4nCIMpWQAs049KEeMvOcNADVxo0UBIQPfSmxB3CWKedngg7sWZdLvLczpe0tLg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/openbsd-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.21.5.tgz",
      "integrity": "sha512-HLNNw99xsvx12lFBUwoT8EVCsSvRNDVxNpjZ7bPn947b8gJPzeHWyNVhFsaerc0n3TsbOINvRP2byTZ5LKezow==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/sunos-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.21.5.tgz",
      "integrity": "sha512-6+gjmFpfy0BHU5Tpptkuh8+uw3mnrvgs+dSPQXQOv3ekbordwnzTVEb4qnIvQcYXq6gzkyTnoZ9dZG+D4garKg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/win32-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.21.5.tgz",
      "integrity": "sha512-Z0gOTd75VvXqyq7nsl93zwahcTROgqvuAcYDUr+vOv8uHhNSKROyU961kgtCD1e95IqPKSQKH7tBTslnS3tA8A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/win32-ia32": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.21.5.tgz",
      "integrity": "sha512-SWXFF1CL2RVNMaVs+BBClwtfZSvDgtL//G/smwAc5oVK/UPu2Gu9tIaRgFmYFFKrmg3SyAjSrElf0TiJ1v8fYA==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/win32-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.21.5.tgz",
      "integrity": "sha512-tQd/1efJuzPC6rCFwEvLtci/xNFcTZknmXs98FYDfGE4wP9ClFV98nyKrzJKVPMhdDnjzLhdUyMX4PsQAPjwIw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@eslint-community/eslint-utils": {
      "version": "4.4.0",
      "resolved": "https://registry.npmjs.org/@eslint-community/eslint-utils/-/eslint-utils-4.4.0.tgz",
      "integrity": "sha512-1/sA4dwrzBAyeUoQ6oxahHKmrZvsnLCg4RfxW3ZFGGmQkSNQPFNLV9CUEFQP1x9EYXHTo5p6xdhZM1Ne9p/AfA==",
      "dev": true,
      "dependencies": {
        "eslint-visitor-keys": "^3.3.0"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "peerDependencies": {
        "eslint": "^6.0.0 || ^7.0.0 || >=8.0.0"
      }
    },
    "node_modules/@eslint-community/eslint-utils/node_modules/eslint-visitor-keys": {
      "version": "3.4.3",
      "resolved": "https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-3.4.3.tgz",
      "integrity": "sha512-wpc+LXeiyiisxPlEkUzU6svyS1frIO3Mgxj1fdy7Pm8Ygzguax2N3Fa/D/ag1WqbOprdI+uY6wMUl8/a2G+iag==",
      "dev": true,
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/@eslint-community/regexpp": {
      "version": "4.11.1",
      "resolved": "https://registry.npmjs.org/@eslint-community/regexpp/-/regexpp-4.11.1.tgz",
      "integrity": "sha512-m4DVN9ZqskZoLU5GlWZadwDnYo3vAEydiUayB9widCl9ffWx2IvPnp6n3on5rJmziJSw9Bv+Z3ChDVdMwXCY8Q==",
      "dev": true,
      "engines": {
        "node": "^12.0.0 || ^14.0.0 || >=16.0.0"
      }
    },
    "node_modules/@eslint/config-array": {
      "version": "0.18.0",
      "resolved": "https://registry.npmjs.org/@eslint/config-array/-/config-array-0.18.0.tgz",
      "integrity": "sha512-fTxvnS1sRMu3+JjXwJG0j/i4RT9u4qJ+lqS/yCGap4lH4zZGzQ7tu+xZqQmcMZq5OBZDL4QRxQzRjkWcGt8IVw==",
      "dev": true,
      "dependencies": {
        "@eslint/object-schema": "^2.1.4",
        "debug": "^4.3.1",
        "minimatch": "^3.1.2"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/core": {
      "version": "0.6.0",
      "resolved": "https://registry.npmjs.org/@eslint/core/-/core-0.6.0.tgz",
      "integrity": "sha512-8I2Q8ykA4J0x0o7cg67FPVnehcqWTBehu/lmY+bolPFHGjh49YzGBMXTvpqVgEbBdvNCSxj6iFgiIyHzf03lzg==",
      "dev": true,
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/eslintrc": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/@eslint/eslintrc/-/eslintrc-3.1.0.tgz",
      "integrity": "sha512-4Bfj15dVJdoy3RfZmmo86RK1Fwzn6SstsvK9JS+BaVKqC6QQQQyXekNaC+g+LKNgkQ+2VhGAzm6hO40AhMR3zQ==",
      "dev": true,
      "dependencies": {
        "ajv": "^6.12.4",
        "debug": "^4.3.2",
        "espree": "^10.0.1",
        "globals": "^14.0.0",
        "ignore": "^5.2.0",
        "import-fresh": "^3.2.1",
        "js-yaml": "^4.1.0",
        "minimatch": "^3.1.2",
        "strip-json-comments": "^3.1.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/@eslint/eslintrc/node_modules/globals": {
      "version": "14.0.0",
      "resolved": "https://registry.npmjs.org/globals/-/globals-14.0.0.tgz",
      "integrity": "sha512-oahGvuMGQlPw/ivIYBjVSrWAfWLBeku5tpPE2fOPLi+WHffIWbuh2tCjhyQhTBPMf5E9jDEH4FOmTYgYwbKwtQ==",
      "dev": true,
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/@eslint/js": {
      "version": "9.12.0",
      "resolved": "https://registry.npmjs.org/@eslint/js/-/js-9.12.0.tgz",
      "integrity": "sha512-eohesHH8WFRUprDNyEREgqP6beG6htMeUYeCpkEgBCieCMme5r9zFWjzAJp//9S+Kub4rqE+jXe9Cp1a7IYIIA==",
      "dev": true,
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/object-schema": {
      "version": "2.1.4",
      "resolved": "https://registry.npmjs.org/@eslint/object-schema/-/object-schema-2.1.4.tgz",
      "integrity": "sha512-BsWiH1yFGjXXS2yvrf5LyuoSIIbPrGUWob917o+BTKuZ7qJdxX8aJLRxs1fS9n6r7vESrq1OUqb68dANcFXuQQ==",
      "dev": true,
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/plugin-kit": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/@eslint/plugin-kit/-/plugin-kit-0.2.0.tgz",
      "integrity": "sha512-vH9PiIMMwvhCx31Af3HiGzsVNULDbyVkHXwlemn/B0TFj/00ho3y55efXrUZTfQipxoHC5u4xq6zblww1zm1Ig==",
      "dev": true,
      "dependencies": {
        "levn": "^0.4.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@humanfs/core": {
      "version": "0.19.0",
      "resolved": "https://registry.npmjs.org/@humanfs/core/-/core-0.19.0.tgz",
      "integrity": "sha512-2cbWIHbZVEweE853g8jymffCA+NCMiuqeECeBBLm8dg2oFdjuGJhgN4UAbI+6v0CKbbhvtXA4qV8YR5Ji86nmw==",
      "dev": true,
      "engines": {
        "node": ">=18.18.0"
      }
    },
    "node_modules/@humanfs/node": {
      "version": "0.16.5",
      "resolved": "https://registry.npmjs.org/@humanfs/node/-/node-0.16.5.tgz",
      "integrity": "sha512-KSPA4umqSG4LHYRodq31VDwKAvaTF4xmVlzM8Aeh4PlU1JQ3IG0wiA8C25d3RQ9nJyM3mBHyI53K06VVL/oFFg==",
      "dev": true,
      "dependencies": {
        "@humanfs/core": "^0.19.0",
        "@humanwhocodes/retry": "^0.3.0"
      },
      "engines": {
        "node": ">=18.18.0"
      }
    },
    "node_modules/@humanwhocodes/module-importer": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/module-importer/-/module-importer-1.0.1.tgz",
      "integrity": "sha512-bxveV4V8v5Yb4ncFTT3rPSgZBOpCkjfK0y4oVVVJwIuDVBRMDXrPyXRL988i5ap9m9bnyEEjWfm5WkBmtffLfA==",
      "dev": true,
      "engines": {
        "node": ">=12.22"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/nzakas"
      }
    },
    "node_modules/@humanwhocodes/retry": {
      "version": "0.3.1",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/retry/-/retry-0.3.1.tgz",
      "integrity": "sha512-JBxkERygn7Bv/GbN5Rv8Ul6LVknS+5Bp6RgDC/O8gEBU/yeH5Ui5C/OlWrTb6qct7LjjfT6Re2NxB0ln0yYybA==",
      "dev": true,
      "engines": {
        "node": ">=18.18"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/nzakas"
      }
    },
    "node_modules/@isaacs/cliui": {
      "version": "8.0.2",
      "resolved": "https://registry.npmjs.org/@isaacs/cliui/-/cliui-8.0.2.tgz",
      "integrity": "sha512-O8jcjabXaleOG9DQ0+ARXWZBTfnP4WNAqzuiJK7ll44AmxGKv/J2M4TPjxjY3znBCfvBXFzucm1twdyFybFqEA==",
      "dev": true,
      "dependencies": {
        "string-width": "^5.1.2",
        "string-width-cjs": "npm:string-width@^4.2.0",
        "strip-ansi": "^7.0.1",
        "strip-ansi-cjs": "npm:strip-ansi@^6.0.1",
        "wrap-ansi": "^8.1.0",
        "wrap-ansi-cjs": "npm:wrap-ansi@^7.0.0"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.5.tgz",
      "integrity": "sha512-IzL8ZoEDIBRWEzlCcRhOaCupYyN5gdIK+Q6fbFdPDg6HqX6jpkItn7DFIpW9LQzXG6Df9sA7+OKnq0qlz/GaQg==",
      "dev": true,
      "dependencies": {
        "@jridgewell/set-array": "^1.2.1",
        "@jridgewell/sourcemap-codec": "^1.4.10",
        "@jridgewell/trace-mapping": "^0.3.24"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "dev": true,
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/set-array": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/@jridgewell/set-array/-/set-array-1.2.1.tgz",
      "integrity": "sha512-R8gLRTZeyp03ymzP/6Lil/28tGeGEzhx1q2k703KGWRAI1VdvPIXdG70VJc2pAMw3NA6JKL5hhFu1sJX0Mnn/A==",
      "dev": true,
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.5.0",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.0.tgz",
      "integrity": "sha512-gv3ZRaISU3fjPAgNsriBRqGWQL6quFx04YMPW/zD8XMLsU32mhCCbfbO6KZFLjvYpCZ8zyDEgqsgf+PwPaM7GQ==",
      "dev": true
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.25",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.25.tgz",
      "integrity": "sha512-vNk6aEwybGtawWmy/PzwnGDOjCkLWSD2wqvjGGAgOAwCGWySYXfYoxt00IJkTF+8Lb57DwOb3Aa0o9CApepiYQ==",
      "dev": true,
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@nodelib/fs.scandir": {
      "version": "2.1.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.scandir/-/fs.scandir-2.1.5.tgz",
      "integrity": "sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==",
      "dev": true,
      "dependencies": {
        "@nodelib/fs.stat": "2.0.5",
        "run-parallel": "^1.1.9"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.stat": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.stat/-/fs.stat-2.0.5.tgz",
      "integrity": "sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==",
      "dev": true,
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.walk": {
      "version": "1.2.8",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.walk/-/fs.walk-1.2.8.tgz",
      "integrity": "sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==",
      "dev": true,
      "dependencies": {
        "@nodelib/fs.scandir": "2.1.5",
        "fastq": "^1.6.0"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@pkgjs/parseargs": {
      "version": "0.11.0",
      "resolved": "https://registry.npmjs.org/@pkgjs/parseargs/-/parseargs-0.11.0.tgz",
      "integrity": "sha512-+1VkjdD0QBLPodGrJUeqarH8VAIvQODIbwh9XpP5Syisf7YoQgsJKPNFoqqLQlu+VQ/tVSshMR6loPMn8U+dPg==",
      "dev": true,
      "optional": true,
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@rollup/rollup-android-arm-eabi": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.24.0.tgz",
      "integrity": "sha512-Q6HJd7Y6xdB48x8ZNVDOqsbh2uByBhgK8PiQgPhwkIw/HC/YX5Ghq2mQY5sRMZWHb3VsFkWooUVOZHKr7DmDIA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-android-arm64": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.24.0.tgz",
      "integrity": "sha512-ijLnS1qFId8xhKjT81uBHuuJp2lU4x2yxa4ctFPtG+MqEE6+C5f/+X/bStmxapgmwLwiL3ih122xv8kVARNAZA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-darwin-arm64": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.24.0.tgz",
      "integrity": "sha512-bIv+X9xeSs1XCk6DVvkO+S/z8/2AMt/2lMqdQbMrmVpgFvXlmde9mLcbQpztXm1tajC3raFDqegsH18HQPMYtA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-darwin-x64": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.24.0.tgz",
      "integrity": "sha512-X6/nOwoFN7RT2svEQWUsW/5C/fYMBe4fnLK9DQk4SX4mgVBiTA9h64kjUYPvGQ0F/9xwJ5U5UfTbl6BEjaQdBQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.24.0.tgz",
      "integrity": "sha512-0KXvIJQMOImLCVCz9uvvdPgfyWo93aHHp8ui3FrtOP57svqrF/roSSR5pjqL2hcMp0ljeGlU4q9o/rQaAQ3AYA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.24.0.tgz",
      "integrity": "sha512-it2BW6kKFVh8xk/BnHfakEeoLPv8STIISekpoF+nBgWM4d55CZKc7T4Dx1pEbTnYm/xEKMgy1MNtYuoA8RFIWw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-gnu": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.24.0.tgz",
      "integrity": "sha512-i0xTLXjqap2eRfulFVlSnM5dEbTVque/3Pi4g2y7cxrs7+a9De42z4XxKLYJ7+OhE3IgxvfQM7vQc43bwTgPwA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-musl": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.24.0.tgz",
      "integrity": "sha512-9E6MKUJhDuDh604Qco5yP/3qn3y7SLXYuiC0Rpr89aMScS2UAmK1wHP2b7KAa1nSjWJc/f/Lc0Wl1L47qjiyQw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-powerpc64le-gnu": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-powerpc64le-gnu/-/rollup-linux-powerpc64le-gnu-4.24.0.tgz",
      "integrity": "sha512-2XFFPJ2XMEiF5Zi2EBf4h73oR1V/lycirxZxHZNc93SqDN/IWhYYSYj8I9381ikUFXZrz2v7r2tOVk2NBwxrWw==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.24.0.tgz",
      "integrity": "sha512-M3Dg4hlwuntUCdzU7KjYqbbd+BLq3JMAOhCKdBE3TcMGMZbKkDdJ5ivNdehOssMCIokNHFOsv7DO4rlEOfyKpg==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-s390x-gnu": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.24.0.tgz",
      "integrity": "sha512-mjBaoo4ocxJppTorZVKWFpy1bfFj9FeCMJqzlMQGjpNPY9JwQi7OuS1axzNIk0nMX6jSgy6ZURDZ2w0QW6D56g==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-gnu": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.24.0.tgz",
      "integrity": "sha512-ZXFk7M72R0YYFN5q13niV0B7G8/5dcQ9JDp8keJSfr3GoZeXEoMHP/HlvqROA3OMbMdfr19IjCeNAnPUG93b6A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-musl": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.24.0.tgz",
      "integrity": "sha512-w1i+L7kAXZNdYl+vFvzSZy8Y1arS7vMgIy8wusXJzRrPyof5LAb02KGr1PD2EkRcl73kHulIID0M501lN+vobQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-win32-arm64-msvc": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.24.0.tgz",
      "integrity": "sha512-VXBrnPWgBpVDCVY6XF3LEW0pOU51KbaHhccHw6AS6vBWIC60eqsH19DAeeObl+g8nKAz04QFdl/Cefta0xQtUQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-ia32-msvc": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.24.0.tgz",
      "integrity": "sha512-xrNcGDU0OxVcPTH/8n/ShH4UevZxKIO6HJFK0e15XItZP2UcaiLFd5kiX7hJnqCbSztUF8Qot+JWBC/QXRPYWQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-x64-msvc": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.24.0.tgz",
      "integrity": "sha512-fbMkAF7fufku0N2dE5TBXcNlg0pt0cJue4xBRE2Qc5Vqikxr4VCgKj/ht6SMdFcOacVA9rqF70APJ8RN/4vMJw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@supabase/auth-js": {
      "version": "2.71.1",
      "resolved": "https://registry.npmjs.org/@supabase/auth-js/-/auth-js-2.71.1.tgz",
      "integrity": "sha512-mMIQHBRc+SKpZFRB2qtupuzulaUhFYupNyxqDj5Jp/LyPvcWvjaJzZzObv6URtL/O6lPxkanASnotGtNpS3H2Q==",
      "dependencies": {
        "@supabase/node-fetch": "^2.6.14"
      }
    },
    "node_modules/@supabase/functions-js": {
      "version": "2.4.6",
      "resolved": "https://registry.npmjs.org/@supabase/functions-js/-/functions-js-2.4.6.tgz",
      "integrity": "sha512-bhjZ7rmxAibjgmzTmQBxJU6ZIBCCJTc3Uwgvdi4FewueUTAGO5hxZT1Sj6tiD+0dSXf9XI87BDdJrg12z8Uaew==",
      "dependencies": {
        "@supabase/node-fetch": "^2.6.14"
      }
    },
    "node_modules/@supabase/node-fetch": {
      "version": "2.6.15",
      "resolved": "https://registry.npmjs.org/@supabase/node-fetch/-/node-fetch-2.6.15.tgz",
      "integrity": "sha512-1ibVeYUacxWYi9i0cf5efil6adJ9WRyZBLivgjs+AUpewx1F3xPi7gLgaASI2SmIQxPoCEjAsLAzKPgMJVgOUQ==",
      "dependencies": {
        "whatwg-url": "^5.0.0"
      },
      "engines": {
        "node": "4.x || >=6.0.0"
      }
    },
    "node_modules/@supabase/postgrest-js": {
      "version": "1.21.4",
      "resolved": "https://registry.npmjs.org/@supabase/postgrest-js/-/postgrest-js-1.21.4.tgz",
      "integrity": "sha512-TxZCIjxk6/dP9abAi89VQbWWMBbybpGWyvmIzTd79OeravM13OjR/YEYeyUOPcM1C3QyvXkvPZhUfItvmhY1IQ==",
      "dependencies": {
        "@supabase/node-fetch": "^2.6.14"
      }
    },
    "node_modules/@supabase/realtime-js": {
      "version": "2.15.5",
      "resolved": "https://registry.npmjs.org/@supabase/realtime-js/-/realtime-js-2.15.5.tgz",
      "integrity": "sha512-/Rs5Vqu9jejRD8ZeuaWXebdkH+J7V6VySbCZ/zQM93Ta5y3mAmocjioa/nzlB6qvFmyylUgKVS1KpE212t30OA==",
      "dependencies": {
        "@supabase/node-fetch": "^2.6.13",
        "@types/phoenix": "^1.6.6",
        "@types/ws": "^8.18.1",
        "ws": "^8.18.2"
      }
    },
    "node_modules/@supabase/storage-js": {
      "version": "2.12.1",
      "resolved": "https://registry.npmjs.org/@supabase/storage-js/-/storage-js-2.12.1.tgz",
      "integrity": "sha512-QWg3HV6Db2J81VQx0PqLq0JDBn4Q8B1FYn1kYcbla8+d5WDmTdwwMr+EJAxNOSs9W4mhKMv+EYCpCrTFlTj4VQ==",
      "dependencies": {
        "@supabase/node-fetch": "^2.6.14"
      }
    },
    "node_modules/@supabase/supabase-js": {
      "version": "2.57.4",
      "resolved": "https://registry.npmjs.org/@supabase/supabase-js/-/supabase-js-2.57.4.tgz",
      "integrity": "sha512-LcbTzFhHYdwfQ7TRPfol0z04rLEyHabpGYANME6wkQ/kLtKNmI+Vy+WEM8HxeOZAtByUFxoUTTLwhXmrh+CcVw==",
      "dependencies": {
        "@supabase/auth-js": "2.71.1",
        "@supabase/functions-js": "2.4.6",
        "@supabase/node-fetch": "2.6.15",
        "@supabase/postgrest-js": "1.21.4",
        "@supabase/realtime-js": "2.15.5",
        "@supabase/storage-js": "2.12.1"
      }
    },
    "node_modules/@types/babel__core": {
      "version": "7.20.5",
      "resolved": "https://registry.npmjs.org/@types/babel__core/-/babel__core-7.20.5.tgz",
      "integrity": "sha512-qoQprZvz5wQFJwMDqeseRXWv3rqMvhgpbXFfVyWhbx9X47POIA6i/+dXefEmZKoAgOaTdaIgNSMqMIU61yRyzA==",
      "dev": true,
      "dependencies": {
        "@babel/parser": "^7.20.7",
        "@babel/types": "^7.20.7",
        "@types/babel__generator": "*",
        "@types/babel__template": "*",
        "@types/babel__traverse": "*"
      }
    },
    "node_modules/@types/babel__generator": {
      "version": "7.6.8",
      "resolved": "https://registry.npmjs.org/@types/babel__generator/-/babel__generator-7.6.8.tgz",
      "integrity": "sha512-ASsj+tpEDsEiFr1arWrlN6V3mdfjRMZt6LtK/Vp/kreFLnr5QH5+DhvD5nINYZXzwJvXeGq+05iUXcAzVrqWtw==",
      "dev": true,
      "dependencies": {
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__template": {
      "version": "7.4.4",
      "resolved": "https://registry.npmjs.org/@types/babel__template/-/babel__template-7.4.4.tgz",
      "integrity": "sha512-h/NUaSyG5EyxBIp8YRxo4RMe2/qQgvyowRwVMzhYhBCONbW8PUsg4lkFMrhgZhUe5z3L3MiLDuvyJ/CaPa2A8A==",
      "dev": true,
      "dependencies": {
        "@babel/parser": "^7.1.0",
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__traverse": {
      "version": "7.20.6",
      "resolved": "https://registry.npmjs.org/@types/babel__traverse/-/babel__traverse-7.20.6.tgz",
      "integrity": "sha512-r1bzfrm0tomOI8g1SzvCaQHo6Lcv6zu0EA+W2kHrt8dyrHQxGzBBL4kdkzIS+jBMV+EYcMAEAqXqYaLJq5rOZg==",
      "dev": true,
      "dependencies": {
        "@babel/types": "^7.20.7"
      }
    },
    "node_modules/@types/estree": {
      "version": "1.0.6",
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.6.tgz",
      "integrity": "sha512-AYnb1nQyY49te+VRAVgmzfcgjYS91mY5P0TKUDCLEM+gNnA+3T6rWITXRLYCpahpqSQbN5cE+gHpnPyXjHWxcw==",
      "dev": true
    },
    "node_modules/@types/json-schema": {
      "version": "7.0.15",
      "resolved": "https://registry.npmjs.org/@types/json-schema/-/json-schema-7.0.15.tgz",
      "integrity": "sha512-5+fP8P8MFNC+AyZCDxrB2pkZFPGzqQWUzpSeuuVLvm8VMcorNYavBqoFcxK8bQz4Qsbn4oUEEem4wDLfcysGHA==",
      "dev": true
    },
    "node_modules/@types/node": {
      "version": "24.3.1",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-24.3.1.tgz",
      "integrity": "sha512-3vXmQDXy+woz+gnrTvuvNrPzekOi+Ds0ReMxw0LzBiK3a+1k0kQn9f2NWk+lgD4rJehFUmYy2gMhJ2ZI+7YP9g==",
      "dependencies": {
        "undici-types": "~7.10.0"
      }
    },
    "node_modules/@types/phoenix": {
      "version": "1.6.6",
      "resolved": "https://registry.npmjs.org/@types/phoenix/-/phoenix-1.6.6.tgz",
      "integrity": "sha512-PIzZZlEppgrpoT2QgbnDU+MMzuR6BbCjllj0bM70lWoejMeNJAxCchxnv7J3XFkI8MpygtRpzXrIlmWUBclP5A=="
    },
    "node_modules/@types/prop-types": {
      "version": "15.7.13",
      "resolved": "https://registry.npmjs.org/@types/prop-types/-/prop-types-15.7.13.tgz",
      "integrity": "sha512-hCZTSvwbzWGvhqxp/RqVqwU999pBf2vp7hzIjiYOsl8wqOmUxkQ6ddw1cV3l8811+kdUFus/q4d1Y3E3SyEifA==",
      "dev": true
    },
    "node_modules/@types/react": {
      "version": "18.3.11",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-18.3.11.tgz",
      "integrity": "sha512-r6QZ069rFTjrEYgFdOck1gK7FLVsgJE7tTz0pQBczlBNUhBNk0MQH4UbnFSwjpQLMkLzgqvBBa+qGpLje16eTQ==",
      "dev": true,
      "dependencies": {
        "@types/prop-types": "*",
        "csstype": "^3.0.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "18.3.0",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-18.3.0.tgz",
      "integrity": "sha512-EhwApuTmMBmXuFOikhQLIBUn6uFg81SwLMOAUgodJF14SOBOCMdU04gDoYi0WOJJHD144TL32z4yDqCW3dnkQg==",
      "dev": true,
      "dependencies": {
        "@types/react": "*"
      }
    },
    "node_modules/@types/ws": {
      "version": "8.18.1",
      "resolved": "https://registry.npmjs.org/@types/ws/-/ws-8.18.1.tgz",
      "integrity": "sha512-ThVF6DCVhA8kUGy+aazFQ4kXQ7E1Ty7A3ypFOe0IcJV8O/M511G99AW24irKrW56Wt44yG9+ij8FaqoBGkuBXg==",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@typescript-eslint/eslint-plugin": {
      "version": "8.8.1",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/eslint-plugin/-/eslint-plugin-8.8.1.tgz",
      "integrity": "sha512-xfvdgA8AP/vxHgtgU310+WBnLB4uJQ9XdyP17RebG26rLtDrQJV3ZYrcopX91GrHmMoH8bdSwMRh2a//TiJ1jQ==",
      "dev": true,
      "dependencies": {
        "@eslint-community/regexpp": "^4.10.0",
        "@typescript-eslint/scope-manager": "8.8.1",
        "@typescript-eslint/type-utils": "8.8.1",
        "@typescript-eslint/utils": "8.8.1",
        "@typescript-eslint/visitor-keys": "8.8.1",
        "graphemer": "^1.4.0",
        "ignore": "^5.3.1",
        "natural-compare": "^1.4.0",
        "ts-api-utils": "^1.3.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "@typescript-eslint/parser": "^8.0.0 || ^8.0.0-alpha.0",
        "eslint": "^8.57.0 || ^9.0.0"
      },
      "peerDependenciesMeta": {
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/@typescript-eslint/parser": {
      "version": "8.8.1",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/parser/-/parser-8.8.1.tgz",
      "integrity": "sha512-hQUVn2Lij2NAxVFEdvIGxT9gP1tq2yM83m+by3whWFsWC+1y8pxxxHUFE1UqDu2VsGi2i6RLcv4QvouM84U+ow==",
      "dev": true,
      "dependencies": {
        "@typescript-eslint/scope-manager": "8.8.1",
        "@typescript-eslint/types": "8.8.1",
        "@typescript-eslint/typescript-estree": "8.8.1",
        "@typescript-eslint/visitor-keys": "8.8.1",
        "debug": "^4.3.4"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "^8.57.0 || ^9.0.0"
      },
      "peerDependenciesMeta": {
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/@typescript-eslint/scope-manager": {
      "version": "8.8.1",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/scope-manager/-/scope-manager-8.8.1.tgz",
      "integrity": "sha512-X4JdU+66Mazev/J0gfXlcC/dV6JI37h+93W9BRYXrSn0hrE64IoWgVkO9MSJgEzoWkxONgaQpICWg8vAN74wlA==",
      "dev": true,
      "dependencies": {
        "@typescript-eslint/types": "8.8.1",
        "@typescript-eslint/visitor-keys": "8.8.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@typescript-eslint/type-utils": {
      "version": "8.8.1",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/type-utils/-/type-utils-8.8.1.tgz",
      "integrity": "sha512-qSVnpcbLP8CALORf0za+vjLYj1Wp8HSoiI8zYU5tHxRVj30702Z1Yw4cLwfNKhTPWp5+P+k1pjmD5Zd1nhxiZA==",
      "dev": true,
      "dependencies": {
        "@typescript-eslint/typescript-estree": "8.8.1",
        "@typescript-eslint/utils": "8.8.1",
        "debug": "^4.3.4",
        "ts-api-utils": "^1.3.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependenciesMeta": {
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/@typescript-eslint/types": {
      "version": "8.8.1",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/types/-/types-8.8.1.tgz",
      "integrity": "sha512-WCcTP4SDXzMd23N27u66zTKMuEevH4uzU8C9jf0RO4E04yVHgQgW+r+TeVTNnO1KIfrL8ebgVVYYMMO3+jC55Q==",
      "dev": true,
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree": {
      "version": "8.8.1",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/typescript-estree/-/typescript-estree-8.8.1.tgz",
      "integrity": "sha512-A5d1R9p+X+1js4JogdNilDuuq+EHZdsH9MjTVxXOdVFfTJXunKJR/v+fNNyO4TnoOn5HqobzfRlc70NC6HTcdg==",
      "dev": true,
      "dependencies": {
        "@typescript-eslint/types": "8.8.1",
        "@typescript-eslint/visitor-keys": "8.8.1",
        "debug": "^4.3.4",
        "fast-glob": "^3.3.2",
        "is-glob": "^4.0.3",
        "minimatch": "^9.0.4",
        "semver": "^7.6.0",
        "ts-api-utils": "^1.3.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependenciesMeta": {
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-2.0.1.tgz",
      "integrity": "sha512-XnAIvQ8eM+kC6aULx6wuQiwVsnzsi9d3WxzV3FpWTGA19F621kwdbsAcFKXgKUHZWsy+mY6iL1sHTxWEFCytDA==",
      "dev": true,
      "dependencies": {
        "balanced-match": "^1.0.0"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch": {
      "version": "9.0.5",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-9.0.5.tgz",
      "integrity": "sha512-G6T0ZX48xgozx7587koeX9Ys2NYy6Gmv//P89sEte9V9whIapMNF4idKxnW2QtCcLiTWlb/wfCabAtAFWhhBow==",
      "dev": true,
      "dependencies": {
        "brace-expansion": "^2.0.1"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree/node_modules/semver": {
      "version": "7.6.3",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.6.3.tgz",
      "integrity": "sha512-oVekP1cKtI+CTDvHWYFUcMtsK/00wmAEfyqKfNdARm8u1wNVhSgaX7A8d4UuIlUI5e84iEwOhs7ZPYRmzU9U6A==",
      "dev": true,
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@typescript-eslint/utils": {
      "version": "8.8.1",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/utils/-/utils-8.8.1.tgz",
      "integrity": "sha512-/QkNJDbV0bdL7H7d0/y0qBbV2HTtf0TIyjSDTvvmQEzeVx8jEImEbLuOA4EsvE8gIgqMitns0ifb5uQhMj8d9w==",
      "dev": true,
      "dependencies": {
        "@eslint-community/eslint-utils": "^4.4.0",
        "@typescript-eslint/scope-manager": "8.8.1",
        "@typescript-eslint/types": "8.8.1",
        "@typescript-eslint/typescript-estree": "8.8.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "^8.57.0 || ^9.0.0"
      }
    },
    "node_modules/@typescript-eslint/visitor-keys": {
      "version": "8.8.1",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/visitor-keys/-/visitor-keys-8.8.1.tgz",
      "integrity": "sha512-0/TdC3aeRAsW7MDvYRwEc1Uwm0TIBfzjPFgg60UU2Haj5qsCs9cc3zNgY71edqE3LbWfF/WoZQd3lJoDXFQpag==",
      "dev": true,
      "dependencies": {
        "@typescript-eslint/types": "8.8.1",
        "eslint-visitor-keys": "^3.4.3"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@typescript-eslint/visitor-keys/node_modules/eslint-visitor-keys": {
      "version": "3.4.3",
      "resolved": "https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-3.4.3.tgz",
      "integrity": "sha512-wpc+LXeiyiisxPlEkUzU6svyS1frIO3Mgxj1fdy7Pm8Ygzguax2N3Fa/D/ag1WqbOprdI+uY6wMUl8/a2G+iag==",
      "dev": true,
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/@vitejs/plugin-react": {
      "version": "4.3.2",
      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-4.3.2.tgz",
      "integrity": "sha512-hieu+o05v4glEBucTcKMK3dlES0OeJlD9YVOAPraVMOInBCwzumaIFiUjr4bHK7NPgnAHgiskUoceKercrN8vg==",
      "dev": true,
      "dependencies": {
        "@babel/core": "^7.25.2",
        "@babel/plugin-transform-react-jsx-self": "^7.24.7",
        "@babel/plugin-transform-react-jsx-source": "^7.24.7",
        "@types/babel__core": "^7.20.5",
        "react-refresh": "^0.14.2"
      },
      "engines": {
        "node": "^14.18.0 || >=16.0.0"
      },
      "peerDependencies": {
        "vite": "^4.2.0 || ^5.0.0"
      }
    },
    "node_modules/acorn": {
      "version": "8.12.1",
      "resolved": "https://registry.npmjs.org/acorn/-/acorn-8.12.1.tgz",
      "integrity": "sha512-tcpGyI9zbizT9JbV6oYE477V6mTlXvvi0T0G3SNIYE2apm/G5huBa1+K89VGeovbg+jycCrfhl3ADxErOuO6Jg==",
      "dev": true,
      "bin": {
        "acorn": "bin/acorn"
      },
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/acorn-jsx": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/acorn-jsx/-/acorn-jsx-5.3.2.tgz",
      "integrity": "sha512-rq9s+JNhf0IChjtDXxllJ7g41oZk5SlXtp0LHwyA5cejwn7vKmKp4pPri6YEePv2PU65sAsegbXtIinmDFDXgQ==",
      "dev": true,
      "peerDependencies": {
        "acorn": "^6.0.0 || ^7.0.0 || ^8.0.0"
      }
    },
    "node_modules/ajv": {
      "version": "6.12.6",
      "resolved": "https://registry.npmjs.org/ajv/-/ajv-6.12.6.tgz",
      "integrity": "sha512-j3fVLgvTo527anyYyJOGTYJbG+vnnQYvE0m5mmkc1TK+nxAppkCLMIL0aZ4dblVCNoGShhm+kzE4ZUykBoMg4g==",
      "dev": true,
      "dependencies": {
        "fast-deep-equal": "^3.1.1",
        "fast-json-stable-stringify": "^2.0.0",
        "json-schema-traverse": "^0.4.1",
        "uri-js": "^4.2.2"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/epoberezkin"
      }
    },
    "node_modules/ansi-regex": {
      "version": "6.1.0",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-6.1.0.tgz",
      "integrity": "sha512-7HSX4QQb4CspciLpVFwyRe79O3xsIZDDLER21kERQ71oaPodF8jL725AgJMFAYbooIqolJoRLuM81SpeUkpkvA==",
      "dev": true,
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-regex?sponsor=1"
      }
    },
    "node_modules/ansi-styles": {
      "version": "3.2.1",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-3.2.1.tgz",
      "integrity": "sha512-VT0ZI6kZRdTh8YyJw3SMbYm/u+NqfsAxEpWO0Pf9sq8/e94WxxOpPKx9FR1FlyCtOVDNOQ+8ntlqFxiRc+r5qA==",
      "dev": true,
      "dependencies": {
        "color-convert": "^1.9.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/any-promise": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/any-promise/-/any-promise-1.3.0.tgz",
      "integrity": "sha512-7UvmKalWRt1wgjL1RrGxoSJW/0QZFIegpeGvZG9kjp8vrRu55XTHbwnqq2GpXm9uLbcuhxm3IqX9OB4MZR1b2A==",
      "dev": true
    },
    "node_modules/anymatch": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/anymatch/-/anymatch-3.1.3.tgz",
      "integrity": "sha512-KMReFUr0B4t+D+OBkjR3KYqvocp2XaSzO55UcB6mgQMd3KbcE+mWTyvVV7D/zsdEbNnV6acZUutkiHQXvTr1Rw==",
      "dev": true,
      "dependencies": {
        "normalize-path": "^3.0.0",
        "picomatch": "^2.0.4"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/arg": {
      "version": "5.0.2",
      "resolved": "https://registry.npmjs.org/arg/-/arg-5.0.2.tgz",
      "integrity": "sha512-PYjyFOLKQ9y57JvQ6QLo8dAgNqswh8M1RMJYdQduT6xbWSgK36P/Z/v+p888pM69jMMfS8Xd8F6I1kQ/I9HUGg==",
      "dev": true
    },
    "node_modules/argparse": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/argparse/-/argparse-2.0.1.tgz",
      "integrity": "sha512-8+9WqebbFzpX9OR+Wa6O29asIogeRMzcGtAINdpMHHyAg10f05aSFVBbcEqGf/PXw1EjAZ+q2/bEBg3DvurK3Q==",
      "dev": true
    },
    "node_modules/autoprefixer": {
      "version": "10.4.20",
      "resolved": "https://registry.npmjs.org/autoprefixer/-/autoprefixer-10.4.20.tgz",
      "integrity": "sha512-XY25y5xSv/wEoqzDyXXME4AFfkZI0P23z6Fs3YgymDnKJkCGOnkL0iTxCa85UTqaSgfcqyf3UA6+c7wUvx/16g==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/autoprefixer"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "dependencies": {
        "browserslist": "^4.23.3",
        "caniuse-lite": "^1.0.30001646",
        "fraction.js": "^4.3.7",
        "normalize-range": "^0.1.2",
        "picocolors": "^1.0.1",
        "postcss-value-parser": "^4.2.0"
      },
      "bin": {
        "autoprefixer": "bin/autoprefixer"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      },
      "peerDependencies": {
        "postcss": "^8.1.0"
      }
    },
    "node_modules/balanced-match": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
      "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==",
      "dev": true
    },
    "node_modules/binary-extensions": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/binary-extensions/-/binary-extensions-2.3.0.tgz",
      "integrity": "sha512-Ceh+7ox5qe7LJuLHoY0feh3pHuUDHAcRUeyL2VYghZwfpkNIy/+8Ocg0a3UuSoYzavmylwuLWQOf3hl0jjMMIw==",
      "dev": true,
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/brace-expansion": {
      "version": "1.1.11",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.11.tgz",
      "integrity": "sha512-iCuPHDFgrHX7H2vEI/5xpz07zSHB00TpugqhmYtVmMO6518mCuRMoOYFldEBl0g187ufozdaHgWKcYFb61qGiA==",
      "dev": true,
      "dependencies": {
        "balanced-match": "^1.0.0",
        "concat-map": "0.0.1"
      }
    },
    "node_modules/braces": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/braces/-/braces-3.0.3.tgz",
      "integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
      "dev": true,
      "dependencies": {
        "fill-range": "^7.1.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/browserslist": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/browserslist/-/browserslist-4.24.0.tgz",
      "integrity": "sha512-Rmb62sR1Zpjql25eSanFGEhAxcFwfA1K0GuQcLoaJBAcENegrQut3hYdhXFF1obQfiDyqIW/cLM5HSJ/9k884A==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "dependencies": {
        "caniuse-lite": "^1.0.30001663",
        "electron-to-chromium": "^1.5.28",
        "node-releases": "^2.0.18",
        "update-browserslist-db": "^1.1.0"
      },
      "bin": {
        "browserslist": "cli.js"
      },
      "engines": {
        "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
      }
    },
    "node_modules/callsites": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/callsites/-/callsites-3.1.0.tgz",
      "integrity": "sha512-P8BjAsXvZS+VIDUI11hHCQEv74YT67YUi5JJFNWIqL235sBmjX4+qx9Muvls5ivyNENctx46xQLQ3aTuE7ssaQ==",
      "dev": true,
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/camelcase-css": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/camelcase-css/-/camelcase-css-2.0.1.tgz",
      "integrity": "sha512-QOSvevhslijgYwRx6Rv7zKdMF8lbRmx+uQGx2+vDc+KI/eBnsy9kit5aj23AgGu3pa4t9AgwbnXWqS+iOY+2aA==",
      "dev": true,
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001667",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001667.tgz",
      "integrity": "sha512-7LTwJjcRkzKFmtqGsibMeuXmvFDfZq/nzIjnmgCGzKKRVzjD72selLDK1oPF/Oxzmt4fNcPvTDvGqSDG4tCALw==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ]
    },
    "node_modules/chalk": {
      "version": "2.4.2",
      "resolved": "https://registry.npmjs.org/chalk/-/chalk-2.4.2.tgz",
      "integrity": "sha512-Mti+f9lpJNcwF4tWV8/OrTTtF1gZi+f8FqlyAdouralcFWFQWF2+NgCHShjkCb+IFBLq9buZwE1xckQU4peSuQ==",
      "dev": true,
      "dependencies": {
        "ansi-styles": "^3.2.1",
        "escape-string-regexp": "^1.0.5",
        "supports-color": "^5.3.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/chokidar": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/chokidar/-/chokidar-3.6.0.tgz",
      "integrity": "sha512-7VT13fmjotKpGipCW9JEQAusEPE+Ei8nl6/g4FBAmIm0GOOLMua9NDDo/DWp0ZAxCr3cPq5ZpBqmPAQgDda2Pw==",
      "dev": true,
      "dependencies": {
        "anymatch": "~3.1.2",
        "braces": "~3.0.2",
        "glob-parent": "~5.1.2",
        "is-binary-path": "~2.1.0",
        "is-glob": "~4.0.1",
        "normalize-path": "~3.0.0",
        "readdirp": "~3.6.0"
      },
      "engines": {
        "node": ">= 8.10.0"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/chokidar/node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "dev": true,
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/color-convert": {
      "version": "1.9.3",
      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-1.9.3.tgz",
      "integrity": "sha512-QfAUtd+vFdAtFQcC8CCyYt1fYWxSqAiK2cSD6zDB8N3cpsEBAvRxp9zOGg6G/SHHJYAT88/az/IuDGALsNVbGg==",
      "dev": true,
      "dependencies": {
        "color-name": "1.1.3"
      }
    },
    "node_modules/color-name": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.3.tgz",
      "integrity": "sha512-72fSenhMw2HZMTVHeCA9KCmpEIbzWiQsjN+BHcBbS9vr1mtt+vJjPdksIBNUmKAW8TFUDPJK5SUU3QhE9NEXDw==",
      "dev": true
    },
    "node_modules/commander": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/commander/-/commander-4.1.1.tgz",
      "integrity": "sha512-NOKm8xhkzAjzFx8B2v5OAHT+u5pRQc2UCa2Vq9jYL/31o2wi9mxBA7LIFs3sV5VSC49z6pEhfbMULvShKj26WA==",
      "dev": true,
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/concat-map": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz",
      "integrity": "sha512-/Srv4dswyQNBfohGpz9o6Yb3Gz3SrUDqBH5rTuhGR7ahtlbYKnVxw2bCFMRljaA7EXHaXZ8wsHdodFvbkhKmqg==",
      "dev": true
    },
    "node_modules/convert-source-map": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/convert-source-map/-/convert-source-map-2.0.0.tgz",
      "integrity": "sha512-Kvp459HrV2FEJ1CAsi1Ku+MY3kasH19TFykTz2xWmMeq6bk2NU3XXvfJ+Q61m0xktWwt+1HSYf3JZsTms3aRJg==",
      "dev": true
    },
    "node_modules/cookie": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-1.1.1.tgz",
      "integrity": "sha512-ei8Aos7ja0weRpFzJnEA9UHJ/7XQmqglbRwnf2ATjcB9Wq874VKH9kfjjirM6UhU2/E5fFYadylyhFldcqSidQ==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/cross-spawn": {
      "version": "7.0.3",
      "resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.3.tgz",
      "integrity": "sha512-iRDPJKUPVEND7dHPO8rkbOnPpyDygcDFtWjpeWNCgy8WP2rXcxXL8TskReQl6OrB2G7+UJrags1q15Fudc7G6w==",
      "dev": true,
      "dependencies": {
        "path-key": "^3.1.0",
        "shebang-command": "^2.0.0",
        "which": "^2.0.1"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/cssesc": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/cssesc/-/cssesc-3.0.0.tgz",
      "integrity": "sha512-/Tb/JcjK111nNScGob5MNtsntNM1aCNUDipB/TkwZFhyDrrE47SOx/18wF2bbjgc3ZzCSKW1T5nt5EbFoAz/Vg==",
      "dev": true,
      "bin": {
        "cssesc": "bin/cssesc"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/csstype": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.1.3.tgz",
      "integrity": "sha512-M1uQkMl8rQK/szD0LNhtqxIPLpimGm8sOBwU7lLnCpSbTyY3yeU1Vc7l4KT5zT4s/yOxHH5O7tIuuLOCnLADRw==",
      "dev": true
    },
    "node_modules/debug": {
      "version": "4.3.7",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.3.7.tgz",
      "integrity": "sha512-Er2nc/H7RrMXZBFCEim6TCmMk02Z8vLC2Rbi1KEBggpo0fS6l0S1nnapwmIi3yW/+GOJap1Krg4w0Hg80oCqgQ==",
      "dev": true,
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/deep-is": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/deep-is/-/deep-is-0.1.4.tgz",
      "integrity": "sha512-oIPzksmTg4/MriiaYGO+okXDT7ztn/w3Eptv/+gSIdMdKsJo0u4CfYNFJPy+4SKMuCqGw2wxnA+URMg3t8a/bQ==",
      "dev": true
    },
    "node_modules/didyoumean": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/didyoumean/-/didyoumean-1.2.2.tgz",
      "integrity": "sha512-gxtyfqMg7GKyhQmb056K7M3xszy/myH8w+B4RT+QXBQsvAOdc3XymqDDPHx1BgPgsdAA5SIifona89YtRATDzw==",
      "dev": true
    },
    "node_modules/dlv": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/dlv/-/dlv-1.1.3.tgz",
      "integrity": "sha512-+HlytyjlPKnIG8XuRG8WvmBP8xs8P71y+SKKS6ZXWoEgLuePxtDoUEiH7WkdePWrQ5JBpE6aoVqfZfJUQkjXwA==",
      "dev": true
    },
    "node_modules/eastasianwidth": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/eastasianwidth/-/eastasianwidth-0.2.0.tgz",
      "integrity": "sha512-I88TYZWc9XiYHRQ4/3c5rjjfgkjhLyW2luGIheGERbNQ6OY7yTybanSpDXZa8y7VUP9YmDcYa+eyq4ca7iLqWA==",
      "dev": true
    },
    "node_modules/electron-to-chromium": {
      "version": "1.5.33",
      "resolved": "https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.33.tgz",
      "integrity": "sha512-+cYTcFB1QqD4j4LegwLfpCNxifb6dDFUAwk6RsLusCwIaZI6or2f+q8rs5tTB2YC53HhOlIbEaqHMAAC8IOIwA==",
      "dev": true
    },
    "node_modules/emoji-regex": {
      "version": "9.2.2",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-9.2.2.tgz",
      "integrity": "sha512-L18DaJsXSUk2+42pv8mLs5jJT2hqFkFE4j21wOmgbUqsZ2hL72NsUU785g9RXgo3s0ZNgVl42TiHp3ZtOv/Vyg==",
      "dev": true
    },
    "node_modules/esbuild": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.21.5.tgz",
      "integrity": "sha512-mg3OPMV4hXywwpoDxu3Qda5xCKQi+vCTZq8S9J/EpkhB2HzKXq4SNFZE3+NK93JYxc8VMSep+lOUSC/RVKaBqw==",
      "dev": true,
      "hasInstallScript": true,
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=12"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.21.5",
        "@esbuild/android-arm": "0.21.5",
        "@esbuild/android-arm64": "0.21.5",
        "@esbuild/android-x64": "0.21.5",
        "@esbuild/darwin-arm64": "0.21.5",
        "@esbuild/darwin-x64": "0.21.5",
        "@esbuild/freebsd-arm64": "0.21.5",
        "@esbuild/freebsd-x64": "0.21.5",
        "@esbuild/linux-arm": "0.21.5",
        "@esbuild/linux-arm64": "0.21.5",
        "@esbuild/linux-ia32": "0.21.5",
        "@esbuild/linux-loong64": "0.21.5",
        "@esbuild/linux-mips64el": "0.21.5",
        "@esbuild/linux-ppc64": "0.21.5",
        "@esbuild/linux-riscv64": "0.21.5",
        "@esbuild/linux-s390x": "0.21.5",
        "@esbuild/linux-x64": "0.21.5",
        "@esbuild/netbsd-x64": "0.21.5",
        "@esbuild/openbsd-x64": "0.21.5",
        "@esbuild/sunos-x64": "0.21.5",
        "@esbuild/win32-arm64": "0.21.5",
        "@esbuild/win32-ia32": "0.21.5",
        "@esbuild/win32-x64": "0.21.5"
      }
    },
    "node_modules/escalade": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
      "dev": true,
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/escape-string-regexp": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-1.0.5.tgz",
      "integrity": "sha512-vbRorB5FUQWvla16U8R/qgaFIya2qGzwDrNmCZuYKrbdSUMG6I1ZCGQRefkRVhuOkIGVne7BQ35DSfo1qvJqFg==",
      "dev": true,
      "engines": {
        "node": ">=0.8.0"
      }
    },
    "node_modules/eslint": {
      "version": "9.12.0",
      "resolved": "https://registry.npmjs.org/eslint/-/eslint-9.12.0.tgz",
      "integrity": "sha512-UVIOlTEWxwIopRL1wgSQYdnVDcEvs2wyaO6DGo5mXqe3r16IoCNWkR29iHhyaP4cICWjbgbmFUGAhh0GJRuGZw==",
      "dev": true,
      "dependencies": {
        "@eslint-community/eslint-utils": "^4.2.0",
        "@eslint-community/regexpp": "^4.11.0",
        "@eslint/config-array": "^0.18.0",
        "@eslint/core": "^0.6.0",
        "@eslint/eslintrc": "^3.1.0",
        "@eslint/js": "9.12.0",
        "@eslint/plugin-kit": "^0.2.0",
        "@humanfs/node": "^0.16.5",
        "@humanwhocodes/module-importer": "^1.0.1",
        "@humanwhocodes/retry": "^0.3.1",
        "@types/estree": "^1.0.6",
        "@types/json-schema": "^7.0.15",
        "ajv": "^6.12.4",
        "chalk": "^4.0.0",
        "cross-spawn": "^7.0.2",
        "debug": "^4.3.2",
        "escape-string-regexp": "^4.0.0",
        "eslint-scope": "^8.1.0",
        "eslint-visitor-keys": "^4.1.0",
        "espree": "^10.2.0",
        "esquery": "^1.5.0",
        "esutils": "^2.0.2",
        "fast-deep-equal": "^3.1.3",
        "file-entry-cache": "^8.0.0",
        "find-up": "^5.0.0",
        "glob-parent": "^6.0.2",
        "ignore": "^5.2.0",
        "imurmurhash": "^0.1.4",
        "is-glob": "^4.0.0",
        "json-stable-stringify-without-jsonify": "^1.0.1",
        "lodash.merge": "^4.6.2",
        "minimatch": "^3.1.2",
        "natural-compare": "^1.4.0",
        "optionator": "^0.9.3",
        "text-table": "^0.2.0"
      },
      "bin": {
        "eslint": "bin/eslint.js"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://eslint.org/donate"
      },
      "peerDependencies": {
        "jiti": "*"
      },
      "peerDependenciesMeta": {
        "jiti": {
          "optional": true
        }
      }
    },
    "node_modules/eslint-plugin-react-hooks": {
      "version": "5.1.0-rc-fb9a90fa48-20240614",
      "resolved": "https://registry.npmjs.org/eslint-plugin-react-hooks/-/eslint-plugin-react-hooks-5.1.0-rc-fb9a90fa48-20240614.tgz",
      "integrity": "sha512-xsiRwaDNF5wWNC4ZHLut+x/YcAxksUd9Rizt7LaEn3bV8VyYRpXnRJQlLOfYaVy9esk4DFP4zPPnoNVjq5Gc0w==",
      "dev": true,
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "eslint": "^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0-0 || ^9.0.0"
      }
    },
    "node_modules/eslint-plugin-react-refresh": {
      "version": "0.4.12",
      "resolved": "https://registry.npmjs.org/eslint-plugin-react-refresh/-/eslint-plugin-react-refresh-0.4.12.tgz",
      "integrity": "sha512-9neVjoGv20FwYtCP6CB1dzR1vr57ZDNOXst21wd2xJ/cTlM2xLq0GWVlSNTdMn/4BtP6cHYBMCSp1wFBJ9jBsg==",
      "dev": true,
      "peerDependencies": {
        "eslint": ">=7"
      }
    },
    "node_modules/eslint-scope": {
      "version": "8.1.0",
      "resolved": "https://registry.npmjs.org/eslint-scope/-/eslint-scope-8.1.0.tgz",
      "integrity": "sha512-14dSvlhaVhKKsa9Fx1l8A17s7ah7Ef7wCakJ10LYk6+GYmP9yDti2oq2SEwcyndt6knfcZyhyxwY3i9yL78EQw==",
      "dev": true,
      "dependencies": {
        "esrecurse": "^4.3.0",
        "estraverse": "^5.2.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/eslint-visitor-keys": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-4.1.0.tgz",
      "integrity": "sha512-Q7lok0mqMUSf5a/AdAZkA5a/gHcO6snwQClVNNvFKCAVlxXucdU8pKydU5ZVZjBx5xr37vGbFFWtLQYreLzrZg==",
      "dev": true,
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/eslint/node_modules/ansi-styles": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",
      "integrity": "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
      "dev": true,
      "dependencies": {
        "color-convert": "^2.0.1"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/eslint/node_modules/chalk": {
      "version": "4.1.2",
      "resolved": "https://registry.npmjs.org/chalk/-/chalk-4.1.2.tgz",
      "integrity": "sha512-oKnbhFyRIXpUuez8iBMmyEa4nbj4IOQyuhc/wy9kY7/WVPcwIO9VA668Pu8RkO7+0G76SLROeyw9CpQ061i4mA==",
      "dev": true,
      "dependencies": {
        "ansi-styles": "^4.1.0",
        "supports-color": "^7.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/chalk?sponsor=1"
      }
    },
    "node_modules/eslint/node_modules/color-convert": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
      "integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
      "dev": true,
      "dependencies": {
        "color-name": "~1.1.4"
      },
      "engines": {
        "node": ">=7.0.0"
      }
    },
    "node_modules/eslint/node_modules/color-name": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
      "integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",
      "dev": true
    },
    "node_modules/eslint/node_modules/escape-string-regexp": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-4.0.0.tgz",
      "integrity": "sha512-TtpcNJ3XAzx3Gq8sWRzJaVajRs0uVxA2YAkdb1jm2YkPz4G6egUFAyA3n5vtEIZefPk5Wa4UXbKuS5fKkJWdgA==",
      "dev": true,
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/eslint/node_modules/has-flag": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-4.0.0.tgz",
      "integrity": "sha512-EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==",
      "dev": true,
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/eslint/node_modules/supports-color": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-7.2.0.tgz",
      "integrity": "sha512-qpCAvRl9stuOHveKsn7HncJRvv501qIacKzQlO/+Lwxc9+0q2wLyv4Dfvt80/DPn2pqOBsJdDiogXGR9+OvwRw==",
      "dev": true,
      "dependencies": {
        "has-flag": "^4.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/espree": {
      "version": "10.2.0",
      "resolved": "https://registry.npmjs.org/espree/-/espree-10.2.0.tgz",
      "integrity": "sha512-upbkBJbckcCNBDBDXEbuhjbP68n+scUd3k/U2EkyM9nw+I/jPiL4cLF/Al06CF96wRltFda16sxDFrxsI1v0/g==",
      "dev": true,
      "dependencies": {
        "acorn": "^8.12.0",
        "acorn-jsx": "^5.3.2",
        "eslint-visitor-keys": "^4.1.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/esquery": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/esquery/-/esquery-1.6.0.tgz",
      "integrity": "sha512-ca9pw9fomFcKPvFLXhBKUK90ZvGibiGOvRJNbjljY7s7uq/5YO4BOzcYtJqExdx99rF6aAcnRxHmcUHcz6sQsg==",
      "dev": true,
      "dependencies": {
        "estraverse": "^5.1.0"
      },
      "engines": {
        "node": ">=0.10"
      }
    },
    "node_modules/esrecurse": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/esrecurse/-/esrecurse-4.3.0.tgz",
      "integrity": "sha512-KmfKL3b6G+RXvP8N1vr3Tq1kL/oCFgn2NYXEtqP8/L3pKapUA4G8cFVaoF3SU323CD4XypR/ffioHmkti6/Tag==",
      "dev": true,
      "dependencies": {
        "estraverse": "^5.2.0"
      },
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/estraverse": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/estraverse/-/estraverse-5.3.0.tgz",
      "integrity": "sha512-MMdARuVEQziNTeJD8DgMqmhwR11BRQ/cBP+pLtYdSTnf3MIO8fFeiINEbX36ZdNlfU/7A9f3gUw49B3oQsvwBA==",
      "dev": true,
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/esutils": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/esutils/-/esutils-2.0.3.tgz",
      "integrity": "sha512-kVscqXk4OCp68SZ0dkgEKVi6/8ij300KBWTJq32P/dYeWTSwK41WyTxalN1eRmA5Z9UU/LX9D7FWSmV9SAYx6g==",
      "dev": true,
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/fast-deep-equal": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz",
      "integrity": "sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==",
      "dev": true
    },
    "node_modules/fast-glob": {
      "version": "3.3.2",
      "resolved": "https://registry.npmjs.org/fast-glob/-/fast-glob-3.3.2.tgz",
      "integrity": "sha512-oX2ruAFQwf/Orj8m737Y5adxDQO0LAB7/S5MnxCdTNDd4p6BsyIVsv9JQsATbTSq8KHRpLwIHbVlUNatxd+1Ow==",
      "dev": true,
      "dependencies": {
        "@nodelib/fs.stat": "^2.0.2",
        "@nodelib/fs.walk": "^1.2.3",
        "glob-parent": "^5.1.2",
        "merge2": "^1.3.0",
        "micromatch": "^4.0.4"
      },
      "engines": {
        "node": ">=8.6.0"
      }
    },
    "node_modules/fast-glob/node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "dev": true,
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/fast-json-stable-stringify": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/fast-json-stable-stringify/-/fast-json-stable-stringify-2.1.0.tgz",
      "integrity": "sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==",
      "dev": true
    },
    "node_modules/fast-levenshtein": {
      "version": "2.0.6",
      "resolved": "https://registry.npmjs.org/fast-levenshtein/-/fast-levenshtein-2.0.6.tgz",
      "integrity": "sha512-DCXu6Ifhqcks7TZKY3Hxp3y6qphY5SJZmrWMDrKcERSOXWQdMhU9Ig/PYrzyw/ul9jOIyh0N4M0tbC5hodg8dw==",
      "dev": true
    },
    "node_modules/fastq": {
      "version": "1.17.1",
      "resolved": "https://registry.npmjs.org/fastq/-/fastq-1.17.1.tgz",
      "integrity": "sha512-sRVD3lWVIXWg6By68ZN7vho9a1pQcN/WBFaAAsDDFzlJjvoGx0P8z7V1t72grFJfJhu3YPZBuu25f7Kaw2jN1w==",
      "dev": true,
      "dependencies": {
        "reusify": "^1.0.4"
      }
    },
    "node_modules/file-entry-cache": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/file-entry-cache/-/file-entry-cache-8.0.0.tgz",
      "integrity": "sha512-XXTUwCvisa5oacNGRP9SfNtYBNAMi+RPwBFmblZEF7N7swHYQS6/Zfk7SRwx4D5j3CH211YNRco1DEMNVfZCnQ==",
      "dev": true,
      "dependencies": {
        "flat-cache": "^4.0.0"
      },
      "engines": {
        "node": ">=16.0.0"
      }
    },
    "node_modules/fill-range": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
      "integrity": "sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==",
      "dev": true,
      "dependencies": {
        "to-regex-range": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/find-up": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/find-up/-/find-up-5.0.0.tgz",
      "integrity": "sha512-78/PXT1wlLLDgTzDs7sjq9hzz0vXD+zn+7wypEe4fXQxCmdmqfGsEPQxmiCSQI3ajFV91bVSsvNtrJRiW6nGng==",
      "dev": true,
      "dependencies": {
        "locate-path": "^6.0.0",
        "path-exists": "^4.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/flat-cache": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/flat-cache/-/flat-cache-4.0.1.tgz",
      "integrity": "sha512-f7ccFPK3SXFHpx15UIGyRJ/FJQctuKZ0zVuN3frBo4HnK3cay9VEW0R6yPYFHC0AgqhukPzKjq22t5DmAyqGyw==",
      "dev": true,
      "dependencies": {
        "flatted": "^3.2.9",
        "keyv": "^4.5.4"
      },
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/flatted": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/flatted/-/flatted-3.3.1.tgz",
      "integrity": "sha512-X8cqMLLie7KsNUDSdzeN8FYK9rEt4Dt67OsG/DNGnYTSDBG4uFAJFBnUeiV+zCVAvwFy56IjM9sH51jVaEhNxw==",
      "dev": true
    },
    "node_modules/foreground-child": {
      "version": "3.3.0",
      "resolved": "https://registry.npmjs.org/foreground-child/-/foreground-child-3.3.0.tgz",
      "integrity": "sha512-Ld2g8rrAyMYFXBhEqMz8ZAHBi4J4uS1i/CxGMDnjyFWddMXLVcDp051DZfu+t7+ab7Wv6SMqpWmyFIj5UbfFvg==",
      "dev": true,
      "dependencies": {
        "cross-spawn": "^7.0.0",
        "signal-exit": "^4.0.1"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/fraction.js": {
      "version": "4.3.7",
      "resolved": "https://registry.npmjs.org/fraction.js/-/fraction.js-4.3.7.tgz",
      "integrity": "sha512-ZsDfxO51wGAXREY55a7la9LScWpwv9RxIrYABrlvOFBlH/ShPnrtsXeuUIfXKKOVicNxQ+o8JTbJvjS4M89yew==",
      "dev": true,
      "engines": {
        "node": "*"
      },
      "funding": {
        "type": "patreon",
        "url": "https://github.com/sponsors/rawify"
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "dev": true,
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/gensync": {
      "version": "1.0.0-beta.2",
      "resolved": "https://registry.npmjs.org/gensync/-/gensync-1.0.0-beta.2.tgz",
      "integrity": "sha512-3hN7NaskYvMDLQY55gnW3NQ+mesEAepTqlg+VEbj7zzqEMBVNhzcGYYeqFo/TlYz6eQiFcp1HcsCZO+nGgS8zg==",
      "dev": true,
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/glob": {
      "version": "10.4.5",
      "resolved": "https://registry.npmjs.org/glob/-/glob-10.4.5.tgz",
      "integrity": "sha512-7Bv8RF0k6xjo7d4A/PxYLbUCfb6c+Vpd2/mB2yRDlew7Jb5hEXiCD9ibfO7wpk8i4sevK6DFny9h7EYbM3/sHg==",
      "dev": true,
      "dependencies": {
        "foreground-child": "^3.1.0",
        "jackspeak": "^3.1.2",
        "minimatch": "^9.0.4",
        "minipass": "^7.1.2",
        "package-json-from-dist": "^1.0.0",
        "path-scurry": "^1.11.1"
      },
      "bin": {
        "glob": "dist/esm/bin.mjs"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/glob-parent": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-6.0.2.tgz",
      "integrity": "sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==",
      "dev": true,
      "dependencies": {
        "is-glob": "^4.0.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/glob/node_modules/brace-expansion": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-2.0.1.tgz",
      "integrity": "sha512-XnAIvQ8eM+kC6aULx6wuQiwVsnzsi9d3WxzV3FpWTGA19F621kwdbsAcFKXgKUHZWsy+mY6iL1sHTxWEFCytDA==",
      "dev": true,
      "dependencies": {
        "balanced-match": "^1.0.0"
      }
    },
    "node_modules/glob/node_modules/minimatch": {
      "version": "9.0.5",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-9.0.5.tgz",
      "integrity": "sha512-G6T0ZX48xgozx7587koeX9Ys2NYy6Gmv//P89sEte9V9whIapMNF4idKxnW2QtCcLiTWlb/wfCabAtAFWhhBow==",
      "dev": true,
      "dependencies": {
        "brace-expansion": "^2.0.1"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/globals": {
      "version": "15.11.0",
      "resolved": "https://registry.npmjs.org/globals/-/globals-15.11.0.tgz",
      "integrity": "sha512-yeyNSjdbyVaWurlwCpcA6XNBrHTMIeDdj0/hnvX/OLJ9ekOXYbLsLinH/MucQyGvNnXhidTdNhTtJaffL2sMfw==",
      "dev": true,
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/graphemer": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/graphemer/-/graphemer-1.4.0.tgz",
      "integrity": "sha512-EtKwoO6kxCL9WO5xipiHTZlSzBm7WLT627TqC/uVRd0HKmq8NXyebnNYxDoBi7wt8eTWrUrKXCOVaFq9x1kgag==",
      "dev": true
    },
    "node_modules/has-flag": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-3.0.0.tgz",
      "integrity": "sha512-sKJf1+ceQBr4SMkvQnBDNDtf4TXpVhVGateu0t918bl30FnbE2m4vNLX+VWe/dpjlb+HugGYzW7uQXH98HPEYw==",
      "dev": true,
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.2.tgz",
      "integrity": "sha512-0hJU9SCPvmMzIBdZFqNPXWa6dqh7WdH0cII9y+CyS8rG3nL48Bclra9HmKhVVUHyPWNH5Y7xDwAB7bfgSjkUMQ==",
      "dev": true,
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/ignore": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/ignore/-/ignore-5.3.2.tgz",
      "integrity": "sha512-hsBTNUqQTDwkWtcdYI2i06Y/nUBEsNEDJKjWdigLvegy8kDuJAS8uRlpkkcQpyEXL0Z/pjDy5HBmMjRCJ2gq+g==",
      "dev": true,
      "engines": {
        "node": ">= 4"
      }
    },
    "node_modules/import-fresh": {
      "version": "3.3.0",
      "resolved": "https://registry.npmjs.org/import-fresh/-/import-fresh-3.3.0.tgz",
      "integrity": "sha512-veYYhQa+D1QBKznvhUHxb8faxlrwUnxseDAbAp457E0wLNio2bOSKnjYDhMj+YiAq61xrMGhQk9iXVk5FzgQMw==",
      "dev": true,
      "dependencies": {
        "parent-module": "^1.0.0",
        "resolve-from": "^4.0.0"
      },
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/imurmurhash": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/imurmurhash/-/imurmurhash-0.1.4.tgz",
      "integrity": "sha512-JmXMZ6wuvDmLiHEml9ykzqO6lwFbof0GG4IkcGaENdCRDDmMVnny7s5HsIgHCbaq0w2MyPhDqkhTUgS2LU2PHA==",
      "dev": true,
      "engines": {
        "node": ">=0.8.19"
      }
    },
    "node_modules/is-binary-path": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/is-binary-path/-/is-binary-path-2.1.0.tgz",
      "integrity": "sha512-ZMERYes6pDydyuGidse7OsHxtbI7WVeUEozgR/g7rd0xUimYNlvZRE/K2MgZTjWy725IfelLeVcEM97mmtRGXw==",
      "dev": true,
      "dependencies": {
        "binary-extensions": "^2.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/is-core-module": {
      "version": "2.15.1",
      "resolved": "https://registry.npmjs.org/is-core-module/-/is-core-module-2.15.1.tgz",
      "integrity": "sha512-z0vtXSwucUJtANQWldhbtbt7BnL0vxiFjIdDLAatwhDYty2bad6s+rijD6Ri4YuYJubLzIJLUidCh09e1djEVQ==",
      "dev": true,
      "dependencies": {
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-extglob": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
      "integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
      "dev": true,
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-fullwidth-code-point": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-3.0.0.tgz",
      "integrity": "sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==",
      "dev": true,
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/is-glob": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
      "integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
      "dev": true,
      "dependencies": {
        "is-extglob": "^2.1.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-number": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz",
      "integrity": "sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==",
      "dev": true,
      "engines": {
        "node": ">=0.12.0"
      }
    },
    "node_modules/isexe": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz",
      "integrity": "sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==",
      "dev": true
    },
    "node_modules/jackspeak": {
      "version": "3.4.3",
      "resolved": "https://registry.npmjs.org/jackspeak/-/jackspeak-3.4.3.tgz",
      "integrity": "sha512-OGlZQpz2yfahA/Rd1Y8Cd9SIEsqvXkLVoSw/cgwhnhFMDbsQFeZYoJJ7bIZBS9BcamUW96asq/npPWugM+RQBw==",
      "dev": true,
      "dependencies": {
        "@isaacs/cliui": "^8.0.2"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      },
      "optionalDependencies": {
        "@pkgjs/parseargs": "^0.11.0"
      }
    },
    "node_modules/jiti": {
      "version": "1.21.6",
      "resolved": "https://registry.npmjs.org/jiti/-/jiti-1.21.6.tgz",
      "integrity": "sha512-2yTgeWTWzMWkHu6Jp9NKgePDaYHbntiwvYuuJLbbN9vl7DC9DvXKOB2BC3ZZ92D3cvV/aflH0osDfwpHepQ53w==",
      "dev": true,
      "bin": {
        "jiti": "bin/jiti.js"
      }
    },
    "node_modules/js-tokens": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ=="
    },
    "node_modules/js-yaml": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/js-yaml/-/js-yaml-4.1.0.tgz",
      "integrity": "sha512-wpxZs9NoxZaJESJGIZTyDEaYpl0FKSA+FB9aJiyemKhMwkxQg63h4T1KJgUGHpTqPDNRcmmYLugrRjJlBtWvRA==",
      "dev": true,
      "dependencies": {
        "argparse": "^2.0.1"
      },
      "bin": {
        "js-yaml": "bin/js-yaml.js"
      }
    },
    "node_modules/jsesc": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/jsesc/-/jsesc-3.0.2.tgz",
      "integrity": "sha512-xKqzzWXDttJuOcawBt4KnKHHIf5oQ/Cxax+0PWFG+DFDgHNAdi+TXECADI+RYiFUMmx8792xsMbbgXj4CwnP4g==",
      "dev": true,
      "bin": {
        "jsesc": "bin/jsesc"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/json-buffer": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/json-buffer/-/json-buffer-3.0.1.tgz",
      "integrity": "sha512-4bV5BfR2mqfQTJm+V5tPPdf+ZpuhiIvTuAB5g8kcrXOZpTT/QwwVRWBywX1ozr6lEuPdbHxwaJlm9G6mI2sfSQ==",
      "dev": true
    },
    "node_modules/json-schema-traverse": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-0.4.1.tgz",
      "integrity": "sha512-xbbCH5dCYU5T8LcEhhuh7HJ88HXuW3qsI3Y0zOZFKfZEHcpWiHU/Jxzk629Brsab/mMiHQti9wMP+845RPe3Vg==",
      "dev": true
    },
    "node_modules/json-stable-stringify-without-jsonify": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/json-stable-stringify-without-jsonify/-/json-stable-stringify-without-jsonify-1.0.1.tgz",
      "integrity": "sha512-Bdboy+l7tA3OGW6FjyFHWkP5LuByj1Tk33Ljyq0axyzdk9//JSi2u3fP1QSmd1KNwq6VOKYGlAu87CisVir6Pw==",
      "dev": true
    },
    "node_modules/json5": {
      "version": "2.2.3",
      "resolved": "https://registry.npmjs.org/json5/-/json5-2.2.3.tgz",
      "integrity": "sha512-XmOWe7eyHYH14cLdVPoyg+GOH3rYX++KpzrylJwSW98t3Nk+U8XOl8FWKOgwtzdb8lXGf6zYwDUzeHMWfxasyg==",
      "dev": true,
      "bin": {
        "json5": "lib/cli.js"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/keyv": {
      "version": "4.5.4",
      "resolved": "https://registry.npmjs.org/keyv/-/keyv-4.5.4.tgz",
      "integrity": "sha512-oxVHkHR/EJf2CNXnWxRLW6mg7JyCCUcG0DtEGmL2ctUo1PNTin1PUil+r/+4r5MpVgC/fn1kjsx7mjSujKqIpw==",
      "dev": true,
      "dependencies": {
        "json-buffer": "3.0.1"
      }
    },
    "node_modules/levn": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/levn/-/levn-0.4.1.tgz",
      "integrity": "sha512-+bT2uH4E5LGE7h/n3evcS/sQlJXCpIp6ym8OWJ5eV6+67Dsql/LaaT7qJBAt2rzfoa/5QBGBhxDix1dMt2kQKQ==",
      "dev": true,
      "dependencies": {
        "prelude-ls": "^1.2.1",
        "type-check": "~0.4.0"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/lilconfig": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/lilconfig/-/lilconfig-3.1.3.tgz",
      "integrity": "sha512-/vlFKAoH5Cgt3Ie+JLhRbwOsCQePABiU3tJ1egGvyQ+33R/vcwM2Zl2QR/LzjsBeItPt3oSVXapn+m4nQDvpzw==",
      "dev": true,
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/antonk52"
      }
    },
    "node_modules/lines-and-columns": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/lines-and-columns/-/lines-and-columns-1.2.4.tgz",
      "integrity": "sha512-7ylylesZQ/PV29jhEDl3Ufjo6ZX7gCqJr5F7PKrqc93v7fzSymt1BpwEU8nAUXs8qzzvqhbjhK5QZg6Mt/HkBg==",
      "dev": true
    },
    "node_modules/locate-path": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/locate-path/-/locate-path-6.0.0.tgz",
      "integrity": "sha512-iPZK6eYjbxRu3uB4/WZ3EsEIMJFMqAoopl3R+zuq0UjcAm/MO6KCweDgPfP3elTztoKP3KtnVHxTn2NHBSDVUw==",
      "dev": true,
      "dependencies": {
        "p-locate": "^5.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/lodash.merge": {
      "version": "4.6.2",
      "resolved": "https://registry.npmjs.org/lodash.merge/-/lodash.merge-4.6.2.tgz",
      "integrity": "sha512-0KpjqXRVvrYyCsX1swR/XTK0va6VQkQM6MNo7PqW77ByjAhoARA8EfrP1N4+KlKj8YS0ZUCtRT/YUuhyYDujIQ==",
      "dev": true
    },
    "node_modules/loose-envify": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz",
      "integrity": "sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==",
      "dependencies": {
        "js-tokens": "^3.0.0 || ^4.0.0"
      },
      "bin": {
        "loose-envify": "cli.js"
      }
    },
    "node_modules/lru-cache": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-5.1.1.tgz",
      "integrity": "sha512-KpNARQA3Iwv+jTA0utUVVbrh+Jlrr1Fv0e56GGzAFOXN7dk/FviaDW8LHmK52DlcH4WP2n6gI8vN1aesBFgo9w==",
      "dev": true,
      "dependencies": {
        "yallist": "^3.0.2"
      }
    },
    "node_modules/lucide-react": {
      "version": "0.344.0",
      "resolved": "https://registry.npmjs.org/lucide-react/-/lucide-react-0.344.0.tgz",
      "integrity": "sha512-6YyBnn91GB45VuVT96bYCOKElbJzUHqp65vX8cDcu55MQL9T969v4dhGClpljamuI/+KMO9P6w9Acq1CVQGvIQ==",
      "peerDependencies": {
        "react": "^16.5.1 || ^17.0.0 || ^18.0.0"
      }
    },
    "node_modules/merge2": {
      "version": "1.4.1",
      "resolved": "https://registry.npmjs.org/merge2/-/merge2-1.4.1.tgz",
      "integrity": "sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==",
      "dev": true,
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/micromatch": {
      "version": "4.0.8",
      "resolved": "https://registry.npmjs.org/micromatch/-/micromatch-4.0.8.tgz",
      "integrity": "sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==",
      "dev": true,
      "dependencies": {
        "braces": "^3.0.3",
        "picomatch": "^2.3.1"
      },
      "engines": {
        "node": ">=8.6"
      }
    },
    "node_modules/minimatch": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-3.1.2.tgz",
      "integrity": "sha512-J7p63hRiAjw1NDEww1W7i37+ByIrOWO5XQQAzZ3VOcL0PNybwpfmV/N05zFAzwQ9USyEcX6t3UO+K5aqBQOIHw==",
      "dev": true,
      "dependencies": {
        "brace-expansion": "^1.1.7"
      },
      "engines": {
        "node": "*"
      }
    },
    "node_modules/minipass": {
      "version": "7.1.2",
      "resolved": "https://registry.npmjs.org/minipass/-/minipass-7.1.2.tgz",
      "integrity": "sha512-qOOzS1cBTWYF4BH8fVePDBOO9iptMnGUEZwNc/cMWnTV2nVLZ7VoNWEPHkYczZA0pdoA7dl6e7FL659nX9S2aw==",
      "dev": true,
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "dev": true
    },
    "node_modules/mz": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/mz/-/mz-2.7.0.tgz",
      "integrity": "sha512-z81GNO7nnYMEhrGh9LeymoE4+Yr0Wn5McHIZMK5cfQCl+NDX08sCZgUc9/6MHni9IWuFLm1Z3HTCXu2z9fN62Q==",
      "dev": true,
      "dependencies": {
        "any-promise": "^1.0.0",
        "object-assign": "^4.0.1",
        "thenify-all": "^1.0.0"
      }
    },
    "node_modules/nanoid": {
      "version": "3.3.7",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.7.tgz",
      "integrity": "sha512-eSRppjcPIatRIMC1U6UngP8XFcz8MQWGQdt1MTBQ7NaAmvXDfvNxbvWV3x2y6CdEUciCSsDHDQZbhYaB8QEo2g==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/natural-compare": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/natural-compare/-/natural-compare-1.4.0.tgz",
      "integrity": "sha512-OWND8ei3VtNC9h7V60qff3SVobHr996CTwgxubgyQYEpg290h9J0buyECNNJexkFm5sOajh5G116RYA1c8ZMSw==",
      "dev": true
    },
    "node_modules/node-releases": {
      "version": "2.0.18",
      "resolved": "https://registry.npmjs.org/node-releases/-/node-releases-2.0.18.tgz",
      "integrity": "sha512-d9VeXT4SJ7ZeOqGX6R5EM022wpL+eWPooLI+5UpWn2jCT1aosUQEhQP214x33Wkwx3JQMvIm+tIoVOdodFS40g==",
      "dev": true
    },
    "node_modules/normalize-path": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/normalize-path/-/normalize-path-3.0.0.tgz",
      "integrity": "sha512-6eZs5Ls3WtCisHWp9S2GUy8dqkpGi4BVSz3GaqiE6ezub0512ESztXUwUB6C6IKbQkY2Pnb/mD4WYojCRwcwLA==",
      "dev": true,
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/normalize-range": {
      "version": "0.1.2",
      "resolved": "https://registry.npmjs.org/normalize-range/-/normalize-range-0.1.2.tgz",
      "integrity": "sha512-bdok/XvKII3nUpklnV6P2hxtMNrCboOjAcyBuQnWEhO665FwrSNRxU+AqpsyvO6LgGYPspN+lu5CLtw4jPRKNA==",
      "dev": true,
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-assign": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
      "dev": true,
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-hash": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/object-hash/-/object-hash-3.0.0.tgz",
      "integrity": "sha512-RSn9F68PjH9HqtltsSnqYC1XXoWe9Bju5+213R98cNGttag9q9yAOTzdbsqvIa7aNm5WffBZFpWYr2aWrklWAw==",
      "dev": true,
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/optionator": {
      "version": "0.9.4",
      "resolved": "https://registry.npmjs.org/optionator/-/optionator-0.9.4.tgz",
      "integrity": "sha512-6IpQ7mKUxRcZNLIObR0hz7lxsapSSIYNZJwXPGeF0mTVqGKFIXj1DQcMoT22S3ROcLyY/rz0PWaWZ9ayWmad9g==",
      "dev": true,
      "dependencies": {
        "deep-is": "^0.1.3",
        "fast-levenshtein": "^2.0.6",
        "levn": "^0.4.1",
        "prelude-ls": "^1.2.1",
        "type-check": "^0.4.0",
        "word-wrap": "^1.2.5"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/p-limit": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/p-limit/-/p-limit-3.1.0.tgz",
      "integrity": "sha512-TYOanM3wGwNGsZN2cVTYPArw454xnXj5qmWF1bEoAc4+cU/ol7GVh7odevjp1FNHduHc3KZMcFduxU5Xc6uJRQ==",
      "dev": true,
      "dependencies": {
        "yocto-queue": "^0.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/p-locate": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/p-locate/-/p-locate-5.0.0.tgz",
      "integrity": "sha512-LaNjtRWUBY++zB5nE/NwcaoMylSPk+S+ZHNB1TzdbMJMny6dynpAGt7X/tl/QYq3TIeE6nxHppbo2LGymrG5Pw==",
      "dev": true,
      "dependencies": {
        "p-limit": "^3.0.2"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/package-json-from-dist": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/package-json-from-dist/-/package-json-from-dist-1.0.1.tgz",
      "integrity": "sha512-UEZIS3/by4OC8vL3P2dTXRETpebLI2NiI5vIrjaD/5UtrkFX/tNbwjTSRAGC/+7CAo2pIcBaRgWmcBBHcsaCIw==",
      "dev": true
    },
    "node_modules/parent-module": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/parent-module/-/parent-module-1.0.1.tgz",
      "integrity": "sha512-GQ2EWRpQV8/o+Aw8YqtfZZPfNRWZYkbidE9k5rpl/hC3vtHHBfGm2Ifi6qWV+coDGkrUKZAxE3Lot5kcsRlh+g==",
      "dev": true,
      "dependencies": {
        "callsites": "^3.0.0"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/path-exists": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/path-exists/-/path-exists-4.0.0.tgz",
      "integrity": "sha512-ak9Qy5Q7jYb2Wwcey5Fpvg2KoAc/ZIhLSLOSBmRmygPsGwkVVt0fZa0qrtMz+m6tJTAHfZQ8FnmB4MG4LWy7/w==",
      "dev": true,
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/path-key": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/path-key/-/path-key-3.1.1.tgz",
      "integrity": "sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==",
      "dev": true,
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/path-parse": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/path-parse/-/path-parse-1.0.7.tgz",
      "integrity": "sha512-LDJzPVEEEPR+y48z93A0Ed0yXb8pAByGWo/k5YYdYgpY2/2EsOsksJrq7lOHxryrVOn1ejG6oAp8ahvOIQD8sw==",
      "dev": true
    },
    "node_modules/path-scurry": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/path-scurry/-/path-scurry-1.11.1.tgz",
      "integrity": "sha512-Xa4Nw17FS9ApQFJ9umLiJS4orGjm7ZzwUrwamcGQuHSzDyth9boKDaycYdDcZDuqYATXw4HFXgaqWTctW/v1HA==",
      "dev": true,
      "dependencies": {
        "lru-cache": "^10.2.0",
        "minipass": "^5.0.0 || ^6.0.2 || ^7.0.0"
      },
      "engines": {
        "node": ">=16 || 14 >=14.18"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/path-scurry/node_modules/lru-cache": {
      "version": "10.4.3",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-10.4.3.tgz",
      "integrity": "sha512-JNAzZcXrCt42VGLuYz0zfAzDfAvJWW6AfYlDBQyDV5DClI2m5sAmK+OIO7s59XfsRsWHp02jAJrRadPRGTt6SQ==",
      "dev": true
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "dev": true
    },
    "node_modules/picomatch": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-2.3.1.tgz",
      "integrity": "sha512-JU3teHTNjmE2VCGFzuY8EXzCDVwEqB2a8fsIvwaStHhAWJEeVd1o1QD80CU6+ZdEXXSLbSsuLwJjkCBWqRQUVA==",
      "dev": true,
      "engines": {
        "node": ">=8.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/pify": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/pify/-/pify-2.3.0.tgz",
      "integrity": "sha512-udgsAY+fTnvv7kI7aaxbqwWNb0AHiB0qBO89PZKPkoTmGOgdbrHDKD+0B2X4uTfJ/FT1R09r9gTsjUjNJotuog==",
      "dev": true,
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/pirates": {
      "version": "4.0.6",
      "resolved": "https://registry.npmjs.org/pirates/-/pirates-4.0.6.tgz",
      "integrity": "sha512-saLsH7WeYYPiD25LDuLRRY/i+6HaPYr6G1OUlN39otzkSTxKnubR9RTxS3/Kk50s1g2JTgFwWQDQyplC5/SHZg==",
      "dev": true,
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/postcss": {
      "version": "8.4.47",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.4.47.tgz",
      "integrity": "sha512-56rxCq7G/XfB4EkXq9Egn5GCqugWvDFjafDOThIdMBsI15iqPqR5r15TfSr1YPYeEI19YeaXMCbY6u88Y76GLQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "dependencies": {
        "nanoid": "^3.3.7",
        "picocolors": "^1.1.0",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/postcss-import": {
      "version": "15.1.0",
      "resolved": "https://registry.npmjs.org/postcss-import/-/postcss-import-15.1.0.tgz",
      "integrity": "sha512-hpr+J05B2FVYUAXHeK1YyI267J/dDDhMU6B6civm8hSY1jYJnBXxzKDKDswzJmtLHryrjhnDjqqp/49t8FALew==",
      "dev": true,
      "dependencies": {
        "postcss-value-parser": "^4.0.0",
        "read-cache": "^1.0.0",
        "resolve": "^1.1.7"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "postcss": "^8.0.0"
      }
    },
    "node_modules/postcss-js": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/postcss-js/-/postcss-js-4.0.1.tgz",
      "integrity": "sha512-dDLF8pEO191hJMtlHFPRa8xsizHaM82MLfNkUHdUtVEV3tgTp5oj+8qbEqYM57SLfc74KSbw//4SeJma2LRVIw==",
      "dev": true,
      "dependencies": {
        "camelcase-css": "^2.0.1"
      },
      "engines": {
        "node": "^12 || ^14 || >= 16"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/postcss/"
      },
      "peerDependencies": {
        "postcss": "^8.4.21"
      }
    },
    "node_modules/postcss-load-config": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/postcss-load-config/-/postcss-load-config-4.0.2.tgz",
      "integrity": "sha512-bSVhyJGL00wMVoPUzAVAnbEoWyqRxkjv64tUl427SKnPrENtq6hJwUojroMz2VB+Q1edmi4IfrAPpami5VVgMQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "dependencies": {
        "lilconfig": "^3.0.0",
        "yaml": "^2.3.4"
      },
      "engines": {
        "node": ">= 14"
      },
      "peerDependencies": {
        "postcss": ">=8.0.9",
        "ts-node": ">=9.0.0"
      },
      "peerDependenciesMeta": {
        "postcss": {
          "optional": true
        },
        "ts-node": {
          "optional": true
        }
      }
    },
    "node_modules/postcss-nested": {
      "version": "6.2.0",
      "resolved": "https://registry.npmjs.org/postcss-nested/-/postcss-nested-6.2.0.tgz",
      "integrity": "sha512-HQbt28KulC5AJzG+cZtj9kvKB93CFCdLvog1WFLf1D+xmMvPGlBstkpTEZfK5+AN9hfJocyBFCNiqyS48bpgzQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "dependencies": {
        "postcss-selector-parser": "^6.1.1"
      },
      "engines": {
        "node": ">=12.0"
      },
      "peerDependencies": {
        "postcss": "^8.2.14"
      }
    },
    "node_modules/postcss-selector-parser": {
      "version": "6.1.2",
      "resolved": "https://registry.npmjs.org/postcss-selector-parser/-/postcss-selector-parser-6.1.2.tgz",
      "integrity": "sha512-Q8qQfPiZ+THO/3ZrOrO0cJJKfpYCagtMUkXbnEfmgUjwXg6z/WBeOyS9APBBPCTSiDV+s4SwQGu8yFsiMRIudg==",
      "dev": true,
      "dependencies": {
        "cssesc": "^3.0.0",
        "util-deprecate": "^1.0.2"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/postcss-value-parser": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/postcss-value-parser/-/postcss-value-parser-4.2.0.tgz",
      "integrity": "sha512-1NNCs6uurfkVbeXG4S8JFT9t19m45ICnif8zWLd5oPSZ50QnwMfK+H3jv408d4jw/7Bttv5axS5IiHoLaVNHeQ==",
      "dev": true
    },
    "node_modules/prelude-ls": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/prelude-ls/-/prelude-ls-1.2.1.tgz",
      "integrity": "sha512-vkcDPrRZo1QZLbn5RLGPpg/WmIQ65qoWWhcGKf/b5eplkkarX0m9z8ppCat4mlOqUsWpyNuYgO3VRyrYHSzX5g==",
      "dev": true,
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/punycode": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
      "dev": true,
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/queue-microtask": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/queue-microtask/-/queue-microtask-1.2.3.tgz",
      "integrity": "sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ]
    },
    "node_modules/react": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
      "integrity": "sha512-wS+hAgJShR0KhEvPJArfuPVN1+Hz1t0Y6n5jLrGQbkb4urgPE/0Rve+1kMB1v/oWgHgm4WIcV+i7F2pTVj+2iQ==",
      "dependencies": {
        "loose-envify": "^1.1.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-18.3.1.tgz",
      "integrity": "sha512-5m4nQKp+rZRb09LNH59GM4BxTh9251/ylbKIbpe7TpGxfJ+9kv6BLkLBXIjjspbgbnIBNqlI23tRnTWT0snUIw==",
      "dependencies": {
        "loose-envify": "^1.1.0",
        "scheduler": "^0.23.2"
      },
      "peerDependencies": {
        "react": "^18.3.1"
      }
    },
    "node_modules/react-refresh": {
      "version": "0.14.2",
      "resolved": "https://registry.npmjs.org/react-refresh/-/react-refresh-0.14.2.tgz",
      "integrity": "sha512-jCvmsr+1IUSMUyzOkRcvnVbX3ZYC6g9TDrDbFuFmRDq7PD4yaGbLKNQL6k2jnArV8hjYxh7hVhAZB6s9HDGpZA==",
      "dev": true,
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-router": {
      "version": "7.13.2",
      "resolved": "https://registry.npmjs.org/react-router/-/react-router-7.13.2.tgz",
      "integrity": "sha512-tX1Aee+ArlKQP+NIUd7SE6Li+CiGKwQtbS+FfRxPX6Pe4vHOo6nr9d++u5cwg+Z8K/x8tP+7qLmujDtfrAoUJA==",
      "license": "MIT",
      "dependencies": {
        "cookie": "^1.0.1",
        "set-cookie-parser": "^2.6.0"
      },
      "engines": {
        "node": ">=20.0.0"
      },
      "peerDependencies": {
        "react": ">=18",
        "react-dom": ">=18"
      },
      "peerDependenciesMeta": {
        "react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/react-router-dom": {
      "version": "7.13.2",
      "resolved": "https://registry.npmjs.org/react-router-dom/-/react-router-dom-7.13.2.tgz",
      "integrity": "sha512-aR7SUORwTqAW0JDeiWF07e9SBE9qGpByR9I8kJT5h/FrBKxPMS6TiC7rmVO+gC0q52Bx7JnjWe8Z1sR9faN4YA==",
      "license": "MIT",
      "dependencies": {
        "react-router": "7.13.2"
      },
      "engines": {
        "node": ">=20.0.0"
      },
      "peerDependencies": {
        "react": ">=18",
        "react-dom": ">=18"
      }
    },
    "node_modules/read-cache": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/read-cache/-/read-cache-1.0.0.tgz",
      "integrity": "sha512-Owdv/Ft7IjOgm/i0xvNDZ1LrRANRfew4b2prF3OWMQLxLfu3bS8FVhCsrSCMK4lR56Y9ya+AThoTpDCTxCmpRA==",
      "dev": true,
      "dependencies": {
        "pify": "^2.3.0"
      }
    },
    "node_modules/readdirp": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/readdirp/-/readdirp-3.6.0.tgz",
      "integrity": "sha512-hOS089on8RduqdbhvQ5Z37A0ESjsqz6qnRcffsMU3495FuTdqSm+7bhJ29JvIOsBDEEnan5DPu9t3To9VRlMzA==",
      "dev": true,
      "dependencies": {
        "picomatch": "^2.2.1"
      },
      "engines": {
        "node": ">=8.10.0"
      }
    },
    "node_modules/resolve": {
      "version": "1.22.8",
      "resolved": "https://registry.npmjs.org/resolve/-/resolve-1.22.8.tgz",
      "integrity": "sha512-oKWePCxqpd6FlLvGV1VU0x7bkPmmCNolxzjMf4NczoDnQcIWrAF+cPtZn5i6n+RfD2d9i0tzpKnG6Yk168yIyw==",
      "dev": true,
      "dependencies": {
        "is-core-module": "^2.13.0",
        "path-parse": "^1.0.7",
        "supports-preserve-symlinks-flag": "^1.0.0"
      },
      "bin": {
        "resolve": "bin/resolve"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/resolve-from": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/resolve-from/-/resolve-from-4.0.0.tgz",
      "integrity": "sha512-pb/MYmXstAkysRFx8piNI1tGFNQIFA3vkE3Gq4EuA1dF6gHp/+vgZqsCGJapvy8N3Q+4o7FwvquPJcnZ7RYy4g==",
      "dev": true,
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/reusify": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/reusify/-/reusify-1.0.4.tgz",
      "integrity": "sha512-U9nH88a3fc/ekCF1l0/UP1IosiuIjyTh7hBvXVMHYgVcfGvt897Xguj2UOLDeI5BG2m7/uwyaLVT6fbtCwTyzw==",
      "dev": true,
      "engines": {
        "iojs": ">=1.0.0",
        "node": ">=0.10.0"
      }
    },
    "node_modules/rollup": {
      "version": "4.24.0",
      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.24.0.tgz",
      "integrity": "sha512-DOmrlGSXNk1DM0ljiQA+i+o0rSLhtii1je5wgk60j49d1jHT5YYttBv1iWOnYSTG+fZZESUOSNiAl89SIet+Cg==",
      "dev": true,
      "dependencies": {
        "@types/estree": "1.0.6"
      },
      "bin": {
        "rollup": "dist/bin/rollup"
      },
      "engines": {
        "node": ">=18.0.0",
        "npm": ">=8.0.0"
      },
      "optionalDependencies": {
        "@rollup/rollup-android-arm-eabi": "4.24.0",
        "@rollup/rollup-android-arm64": "4.24.0",
        "@rollup/rollup-darwin-arm64": "4.24.0",
        "@rollup/rollup-darwin-x64": "4.24.0",
        "@rollup/rollup-linux-arm-gnueabihf": "4.24.0",
        "@rollup/rollup-linux-arm-musleabihf": "4.24.0",
        "@rollup/rollup-linux-arm64-gnu": "4.24.0",
        "@rollup/rollup-linux-arm64-musl": "4.24.0",
        "@rollup/rollup-linux-powerpc64le-gnu": "4.24.0",
        "@rollup/rollup-linux-riscv64-gnu": "4.24.0",
        "@rollup/rollup-linux-s390x-gnu": "4.24.0",
        "@rollup/rollup-linux-x64-gnu": "4.24.0",
        "@rollup/rollup-linux-x64-musl": "4.24.0",
        "@rollup/rollup-win32-arm64-msvc": "4.24.0",
        "@rollup/rollup-win32-ia32-msvc": "4.24.0",
        "@rollup/rollup-win32-x64-msvc": "4.24.0",
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/run-parallel": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/run-parallel/-/run-parallel-1.2.0.tgz",
      "integrity": "sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "dependencies": {
        "queue-microtask": "^1.2.2"
      }
    },
    "node_modules/scheduler": {
      "version": "0.23.2",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.23.2.tgz",
      "integrity": "sha512-UOShsPwz7NrMUqhR6t0hWjFduvOzbtv7toDH1/hIrfRNIDBnnBWd0CwJTGvTpngVlmwGCdP9/Zl/tVrDqcuYzQ==",
      "dependencies": {
        "loose-envify": "^1.1.0"
      }
    },
    "node_modules/semver": {
      "version": "6.3.1",
      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.1.tgz",
      "integrity": "sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==",
      "dev": true,
      "bin": {
        "semver": "bin/semver.js"
      }
    },
    "node_modules/set-cookie-parser": {
      "version": "2.7.2",
      "resolved": "https://registry.npmjs.org/set-cookie-parser/-/set-cookie-parser-2.7.2.tgz",
      "integrity": "sha512-oeM1lpU/UvhTxw+g3cIfxXHyJRc/uidd3yK1P242gzHds0udQBYzs3y8j4gCCW+ZJ7ad0yctld8RYO+bdurlvw==",
      "license": "MIT"
    },
    "node_modules/shebang-command": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/shebang-command/-/shebang-command-2.0.0.tgz",
      "integrity": "sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==",
      "dev": true,
      "dependencies": {
        "shebang-regex": "^3.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/shebang-regex": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/shebang-regex/-/shebang-regex-3.0.0.tgz",
      "integrity": "sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==",
      "dev": true,
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/signal-exit": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/signal-exit/-/signal-exit-4.1.0.tgz",
      "integrity": "sha512-bzyZ1e88w9O1iNJbKnOlvYTrWPDl46O1bG0D3XInv+9tkPrxrN8jUUTiFlDkkmKWgn1M6CfIA13SuGqOa9Korw==",
      "dev": true,
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      "dev": true,
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/string-width": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-5.1.2.tgz",
      "integrity": "sha512-HnLOCR3vjcY8beoNLtcjZ5/nxn2afmME6lhrDrebokqMap+XbeW8n9TXpPDOqdGK5qcI3oT0GKTW6wC7EMiVqA==",
      "dev": true,
      "dependencies": {
        "eastasianwidth": "^0.2.0",
        "emoji-regex": "^9.2.2",
        "strip-ansi": "^7.0.1"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/string-width-cjs": {
      "name": "string-width",
      "version": "4.2.3",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
      "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
      "dev": true,
      "dependencies": {
        "emoji-regex": "^8.0.0",
        "is-fullwidth-code-point": "^3.0.0",
        "strip-ansi": "^6.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/string-width-cjs/node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "dev": true,
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/string-width-cjs/node_modules/emoji-regex": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
      "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
      "dev": true
    },
    "node_modules/string-width-cjs/node_modules/strip-ansi": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      "dev": true,
      "dependencies": {
        "ansi-regex": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/strip-ansi": {
      "version": "7.1.0",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-7.1.0.tgz",
      "integrity": "sha512-iq6eVVI64nQQTRYq2KtEg2d2uU7LElhTJwsH4YzIHZshxlgZms/wIc4VoDQTlG/IvVIrBKG06CrZnp0qv7hkcQ==",
      "dev": true,
      "dependencies": {
        "ansi-regex": "^6.0.1"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/strip-ansi?sponsor=1"
      }
    },
    "node_modules/strip-ansi-cjs": {
      "name": "strip-ansi",
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      "dev": true,
      "dependencies": {
        "ansi-regex": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/strip-ansi-cjs/node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "dev": true,
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/strip-json-comments": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/strip-json-comments/-/strip-json-comments-3.1.1.tgz",
      "integrity": "sha512-6fPc+R4ihwqP6N/aIv2f1gMH8lOVtWQHoqC4yK6oSDVVocumAsfCqjkXnqiYMhmMwS/mEHLp7Vehlt3ql6lEig==",
      "dev": true,
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/sucrase": {
      "version": "3.35.0",
      "resolved": "https://registry.npmjs.org/sucrase/-/sucrase-3.35.0.tgz",
      "integrity": "sha512-8EbVDiu9iN/nESwxeSxDKe0dunta1GOlHufmSSXxMD2z2/tMZpDMpvXQGsc+ajGo8y2uYUmixaSRUc/QPoQ0GA==",
      "dev": true,
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.2",
        "commander": "^4.0.0",
        "glob": "^10.3.10",
        "lines-and-columns": "^1.1.6",
        "mz": "^2.7.0",
        "pirates": "^4.0.1",
        "ts-interface-checker": "^0.1.9"
      },
      "bin": {
        "sucrase": "bin/sucrase",
        "sucrase-node": "bin/sucrase-node"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/supports-color": {
      "version": "5.5.0",
      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-5.5.0.tgz",
      "integrity": "sha512-QjVjwdXIt408MIiAqCX4oUKsgU2EqAGzs2Ppkm4aQYbjm+ZEWEcW4SfFNTr4uMNZma0ey4f5lgLrkB0aX0QMow==",
      "dev": true,
      "dependencies": {
        "has-flag": "^3.0.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/supports-preserve-symlinks-flag": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/supports-preserve-symlinks-flag/-/supports-preserve-symlinks-flag-1.0.0.tgz",
      "integrity": "sha512-ot0WnXS9fgdkgIcePe6RHNk1WA8+muPa6cSjeR3V8K27q9BB1rTE3R1p7Hv0z1ZyAc8s6Vvv8DIyWf681MAt0w==",
      "dev": true,
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/tailwindcss": {
      "version": "3.4.17",
      "resolved": "https://registry.npmjs.org/tailwindcss/-/tailwindcss-3.4.17.tgz",
      "integrity": "sha512-w33E2aCvSDP0tW9RZuNXadXlkHXqFzSkQew/aIa2i/Sj8fThxwovwlXHSPXTbAHwEIhBFXAedUhP2tueAKP8Og==",
      "dev": true,
      "dependencies": {
        "@alloc/quick-lru": "^5.2.0",
        "arg": "^5.0.2",
        "chokidar": "^3.6.0",
        "didyoumean": "^1.2.2",
        "dlv": "^1.1.3",
        "fast-glob": "^3.3.2",
        "glob-parent": "^6.0.2",
        "is-glob": "^4.0.3",
        "jiti": "^1.21.6",
        "lilconfig": "^3.1.3",
        "micromatch": "^4.0.8",
        "normalize-path": "^3.0.0",
        "object-hash": "^3.0.0",
        "picocolors": "^1.1.1",
        "postcss": "^8.4.47",
        "postcss-import": "^15.1.0",
        "postcss-js": "^4.0.1",
        "postcss-load-config": "^4.0.2",
        "postcss-nested": "^6.2.0",
        "postcss-selector-parser": "^6.1.2",
        "resolve": "^1.22.8",
        "sucrase": "^3.35.0"
      },
      "bin": {
        "tailwind": "lib/cli.js",
        "tailwindcss": "lib/cli.js"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/text-table": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/text-table/-/text-table-0.2.0.tgz",
      "integrity": "sha512-N+8UisAXDGk8PFXP4HAzVR9nbfmVJ3zYLAWiTIoqC5v5isinhr+r5uaO8+7r3BMfuNIufIsA7RdpVgacC2cSpw==",
      "dev": true
    },
    "node_modules/thenify": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/thenify/-/thenify-3.3.1.tgz",
      "integrity": "sha512-RVZSIV5IG10Hk3enotrhvz0T9em6cyHBLkH/YAZuKqd8hRkKhSfCGIcP2KUY0EPxndzANBmNllzWPwak+bheSw==",
      "dev": true,
      "dependencies": {
        "any-promise": "^1.0.0"
      }
    },
    "node_modules/thenify-all": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/thenify-all/-/thenify-all-1.6.0.tgz",
      "integrity": "sha512-RNxQH/qI8/t3thXJDwcstUO4zeqo64+Uy/+sNVRBx4Xn2OX+OZ9oP+iJnNFqplFra2ZUVeKCSa2oVWi3T4uVmA==",
      "dev": true,
      "dependencies": {
        "thenify": ">= 3.1.0 < 4"
      },
      "engines": {
        "node": ">=0.8"
      }
    },
    "node_modules/to-fast-properties": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/to-fast-properties/-/to-fast-properties-2.0.0.tgz",
      "integrity": "sha512-/OaKK0xYrs3DmxRYqL/yDc+FxFUVYhDlXMhRmv3z915w2HF1tnN1omB354j8VUGO/hbRzyD6Y3sA7v7GS/ceog==",
      "dev": true,
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/to-regex-range": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz",
      "integrity": "sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==",
      "dev": true,
      "dependencies": {
        "is-number": "^7.0.0"
      },
      "engines": {
        "node": ">=8.0"
      }
    },
    "node_modules/tr46": {
      "version": "0.0.3",
      "resolved": "https://registry.npmjs.org/tr46/-/tr46-0.0.3.tgz",
      "integrity": "sha512-N3WMsuqV66lT30CrXNbEjx4GEwlow3v6rr4mCcv6prnfwhS01rkgyFdjPNBYd9br7LpXV1+Emh01fHnq2Gdgrw=="
    },
    "node_modules/ts-api-utils": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/ts-api-utils/-/ts-api-utils-1.3.0.tgz",
      "integrity": "sha512-UQMIo7pb8WRomKR1/+MFVLTroIvDVtMX3K6OUir8ynLyzB8Jeriont2bTAtmNPa1ekAgN7YPDyf6V+ygrdU+eQ==",
      "dev": true,
      "engines": {
        "node": ">=16"
      },
      "peerDependencies": {
        "typescript": ">=4.2.0"
      }
    },
    "node_modules/ts-interface-checker": {
      "version": "0.1.13",
      "resolved": "https://registry.npmjs.org/ts-interface-checker/-/ts-interface-checker-0.1.13.tgz",
      "integrity": "sha512-Y/arvbn+rrz3JCKl9C4kVNfTfSm2/mEp5FSz5EsZSANGPSlQrpRI5M4PKF+mJnE52jOO90PnPSc3Ur3bTQw0gA==",
      "dev": true
    },
    "node_modules/type-check": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/type-check/-/type-check-0.4.0.tgz",
      "integrity": "sha512-XleUoc9uwGXqjWwXaUTZAmzMcFZ5858QA2vvx1Ur5xIcixXIP+8LnFDgRplU30us6teqdlskFfu+ae4K79Ooew==",
      "dev": true,
      "dependencies": {
        "prelude-ls": "^1.2.1"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/typescript": {
      "version": "5.6.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.6.3.tgz",
      "integrity": "sha512-hjcS1mhfuyi4WW8IWtjP7brDrG2cuDZukyrYrSauoXGNgx0S7zceP07adYkJycEr56BOUTNPzbInooiN3fn1qw==",
      "dev": true,
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/typescript-eslint": {
      "version": "8.8.1",
      "resolved": "https://registry.npmjs.org/typescript-eslint/-/typescript-eslint-8.8.1.tgz",
      "integrity": "sha512-R0dsXFt6t4SAFjUSKFjMh4pXDtq04SsFKCVGDP3ZOzNP7itF0jBcZYU4fMsZr4y7O7V7Nc751dDeESbe4PbQMQ==",
      "dev": true,
      "dependencies": {
        "@typescript-eslint/eslint-plugin": "8.8.1",
        "@typescript-eslint/parser": "8.8.1",
        "@typescript-eslint/utils": "8.8.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependenciesMeta": {
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/undici-types": {
      "version": "7.10.0",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-7.10.0.tgz",
      "integrity": "sha512-t5Fy/nfn+14LuOc2KNYg75vZqClpAiqscVvMygNnlsHBFpSXdJaYtXMcdNLpl/Qvc3P2cB3s6lOV51nqsFq4ag=="
    },
    "node_modules/update-browserslist-db": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.1.1.tgz",
      "integrity": "sha512-R8UzCaa9Az+38REPiJ1tXlImTJXlVfgHZsglwBD/k6nj76ctsH1E3q4doGrukiLQd3sGQYu56r5+lo5r94l29A==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "dependencies": {
        "escalade": "^3.2.0",
        "picocolors": "^1.1.0"
      },
      "bin": {
        "update-browserslist-db": "cli.js"
      },
      "peerDependencies": {
        "browserslist": ">= 4.21.0"
      }
    },
    "node_modules/uri-js": {
      "version": "4.4.1",
      "resolved": "https://registry.npmjs.org/uri-js/-/uri-js-4.4.1.tgz",
      "integrity": "sha512-7rKUyy33Q1yc98pQ1DAmLtwX109F7TIfWlW1Ydo8Wl1ii1SeHieeh0HHfPeL2fMXK6z0s8ecKs9frCuLJvndBg==",
      "dev": true,
      "dependencies": {
        "punycode": "^2.1.0"
      }
    },
    "node_modules/util-deprecate": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/util-deprecate/-/util-deprecate-1.0.2.tgz",
      "integrity": "sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw==",
      "dev": true
    },
    "node_modules/vite": {
      "version": "5.4.8",
      "resolved": "https://registry.npmjs.org/vite/-/vite-5.4.8.tgz",
      "integrity": "sha512-FqrItQ4DT1NC4zCUqMB4c4AZORMKIa0m8/URVCZ77OZ/QSNeJ54bU1vrFADbDsuwfIPcgknRkmqakQcgnL4GiQ==",
      "dev": true,
      "dependencies": {
        "esbuild": "^0.21.3",
        "postcss": "^8.4.43",
        "rollup": "^4.20.0"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^18.0.0 || >=20.0.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^18.0.0 || >=20.0.0",
        "less": "*",
        "lightningcss": "^1.21.0",
        "sass": "*",
        "sass-embedded": "*",
        "stylus": "*",
        "sugarss": "*",
        "terser": "^5.4.0"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "lightningcss": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        }
      }
    },
    "node_modules/webidl-conversions": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-3.0.1.tgz",
      "integrity": "sha512-2JAn3z8AR6rjK8Sm8orRC0h/bcl/DqL7tRPdGZ4I1CjdF+EaMLmYxBHyXuKL849eucPFhvBoxMsflfOb8kxaeQ=="
    },
    "node_modules/whatwg-url": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-5.0.0.tgz",
      "integrity": "sha512-saE57nupxk6v3HY35+jzBwYa0rKSy0XR8JSxZPwgLr7ys0IBzhGviA1/TUGJLmSVqs8pb9AnvICXEuOHLprYTw==",
      "dependencies": {
        "tr46": "~0.0.3",
        "webidl-conversions": "^3.0.0"
      }
    },
    "node_modules/which": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/which/-/which-2.0.2.tgz",
      "integrity": "sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==",
      "dev": true,
      "dependencies": {
        "isexe": "^2.0.0"
      },
      "bin": {
        "node-which": "bin/node-which"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/word-wrap": {
      "version": "1.2.5",
      "resolved": "https://registry.npmjs.org/word-wrap/-/word-wrap-1.2.5.tgz",
      "integrity": "sha512-BN22B5eaMMI9UMtjrGd5g5eCYPpCPDUy0FJXbYsaT5zYxjFOckS53SQDE3pWkVoWpHXVb3BrYcEN4Twa55B5cA==",
      "dev": true,
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/wrap-ansi": {
      "version": "8.1.0",
      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-8.1.0.tgz",
      "integrity": "sha512-si7QWI6zUMq56bESFvagtmzMdGOtoxfR+Sez11Mobfc7tm+VkUckk9bW2UeffTGVUbOksxmSw0AA2gs8g71NCQ==",
      "dev": true,
      "dependencies": {
        "ansi-styles": "^6.1.0",
        "string-width": "^5.0.1",
        "strip-ansi": "^7.0.1"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/wrap-ansi?sponsor=1"
      }
    },
    "node_modules/wrap-ansi-cjs": {
      "name": "wrap-ansi",
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-7.0.0.tgz",
      "integrity": "sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==",
      "dev": true,
      "dependencies": {
        "ansi-styles": "^4.0.0",
        "string-width": "^4.1.0",
        "strip-ansi": "^6.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/wrap-ansi?sponsor=1"
      }
    },
    "node_modules/wrap-ansi-cjs/node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "dev": true,
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/wrap-ansi-cjs/node_modules/ansi-styles": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",
      "integrity": "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
      "dev": true,
      "dependencies": {
        "color-convert": "^2.0.1"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/wrap-ansi-cjs/node_modules/color-convert": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
      "integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
      "dev": true,
      "dependencies": {
        "color-name": "~1.1.4"
      },
      "engines": {
        "node": ">=7.0.0"
      }
    },
    "node_modules/wrap-ansi-cjs/node_modules/color-name": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
      "integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",
      "dev": true
    },
    "node_modules/wrap-ansi-cjs/node_modules/emoji-regex": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
      "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
      "dev": true
    },
    "node_modules/wrap-ansi-cjs/node_modules/string-width": {
      "version": "4.2.3",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
      "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
      "dev": true,
      "dependencies": {
        "emoji-regex": "^8.0.0",
        "is-fullwidth-code-point": "^3.0.0",
        "strip-ansi": "^6.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/wrap-ansi-cjs/node_modules/strip-ansi": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      "dev": true,
      "dependencies": {
        "ansi-regex": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/wrap-ansi/node_modules/ansi-styles": {
      "version": "6.2.1",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-6.2.1.tgz",
      "integrity": "sha512-bN798gFfQX+viw3R7yrGWRqnrN2oRkEkUjjl4JNn4E8GxxbjtG3FbrEIIY3l8/hrwUwIeCZvi4QuOTP4MErVug==",
      "dev": true,
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/ws": {
      "version": "8.18.3",
      "resolved": "https://registry.npmjs.org/ws/-/ws-8.18.3.tgz",
      "integrity": "sha512-PEIGCY5tSlUt50cqyMXfCzX+oOPqN0vuGqWzbcJ2xvnkzkq46oOpz7dQaTDBdfICb4N14+GARUDw2XV2N4tvzg==",
      "engines": {
        "node": ">=10.0.0"
      },
      "peerDependencies": {
        "bufferutil": "^4.0.1",
        "utf-8-validate": ">=5.0.2"
      },
      "peerDependenciesMeta": {
        "bufferutil": {
          "optional": true
        },
        "utf-8-validate": {
          "optional": true
        }
      }
    },
    "node_modules/yallist": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/yallist/-/yallist-3.1.1.tgz",
      "integrity": "sha512-a4UGQaWPH59mOXUYnAG2ewncQS4i4F43Tv3JoAM+s2VDAmS9NsK8GpDMLrCHPksFT7h3K6TOoUNn2pb7RoXx4g==",
      "dev": true
    },
    "node_modules/yaml": {
      "version": "2.5.1",
      "resolved": "https://registry.npmjs.org/yaml/-/yaml-2.5.1.tgz",
      "integrity": "sha512-bLQOjaX/ADgQ20isPJRvF0iRUHIxVhYvr53Of7wGcWlO2jvtUlH5m87DsmulFVxRpNLOnI4tB6p/oh8D7kpn9Q==",
      "dev": true,
      "bin": {
        "yaml": "bin.mjs"
      },
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/yocto-queue": {
      "version": "0.1.0",
      "resolved": "https://registry.npmjs.org/yocto-queue/-/yocto-queue-0.1.0.tgz",
      "integrity": "sha512-rVksvsnNCdJ/ohGc6xgPwyN8eheCxsiLM8mxuE/t/mOVqJewPuO1miLpTHQiRgTKCLexL4MeAFVagts7HmNZ2Q==",
      "dev": true,
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    }
  }
}

```

## ./package.json

```
{
  "name": "vite-react-typescript-starter",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit -p tsconfig.app.json"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.57.4",
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.13.2"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2"
  }
}

```

## ./postcss.config.js

```
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

```

## ./src/App.tsx

```
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Insights from './pages/Insights';
import Meals from './pages/Meals';
import BMLog from './pages/BMLog';
import FoodLog from './pages/FoodLog';
import SymptomsLog from './pages/SymptomsLog';
import SleepLog from './pages/SleepLog';
import StressLog from './pages/StressLog';
import HydrationLog from './pages/HydrationLog';
import MedicationLog from './pages/MedicationLog';
import Reports from './pages/Reports';
import Trends from './pages/Trends';
import Community from './pages/Community';
import Settings from './pages/Settings';
import Account from './pages/Account';
import Privacy from './pages/Privacy';
import Disclaimer from './pages/Disclaimer';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meals"
            element={
              <ProtectedRoute>
                <Meals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bm-log"
            element={
              <ProtectedRoute>
                <BMLog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/food-log"
            element={
              <ProtectedRoute>
                <FoodLog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/symptoms-log"
            element={
              <ProtectedRoute>
                <SymptomsLog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sleep-log"
            element={
              <ProtectedRoute>
                <SleepLog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stress-log"
            element={
              <ProtectedRoute>
                <StressLog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hydration-log"
            element={
              <ProtectedRoute>
                <HydrationLog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medication-log"
            element={
              <ProtectedRoute>
                <MedicationLog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trends"
            element={
              <ProtectedRoute>
                <Trends />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

```

## ./src/animations.css

```
@keyframes toastSlideIn {
  from { opacity: 0; transform: translateX(100%) scale(0.95); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}

@keyframes toastSlideOut {
  from { opacity: 1; transform: translateX(0) scale(1); }
  to { opacity: 0; transform: translateX(100%) scale(0.95); }
}

@keyframes toastProgressShrink {
  from { width: 100%; }
  to { width: 0%; }
}

@keyframes toastCheckPop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes emptyStateFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes emptyStateIconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@keyframes welcomeSlideDown {
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes encouragementFade {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes flamePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

```

## ./src/components/Button.tsx

```
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-teal-600 hover:bg-teal-700 text-white',
    secondary: 'bg-blue-600 hover:bg-blue-700 text-white',
    outline: 'border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

```

## ./src/components/Card.tsx

```
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
}

```

## ./src/components/EmptyState.tsx

```
import { ReactNode } from 'react';
import { getEmptyStateMessage } from '../utils/copySystem';

interface EmptyStateProps {
  category: string;
  icon: ReactNode;
}

export default function EmptyState({ category, icon }: EmptyStateProps) {
  const copy = getEmptyStateMessage(category);

  return (
    <div
      className="py-12 px-4 text-center"
      style={{ animation: 'emptyStateFadeIn 0.4s ease-out both' }}
    >
      <div
        className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center"
        style={{ animation: 'emptyStateIconFloat 3s ease-in-out infinite' }}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{copy.title}</h3>
      <p className="text-sm text-gray-500 mb-3 max-w-xs mx-auto leading-relaxed">
        {copy.subtitle}
      </p>
      <p className="text-xs text-gray-400 max-w-xs mx-auto">{copy.hint}</p>
    </div>
  );
}

```

## ./src/components/EncouragementPrompt.tsx

```
import { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const nudgeMessages = [
  'Your health data misses you. A quick log takes 30 seconds.',
  'Even a single entry helps build the bigger picture.',
  'The best time to log was yesterday. The second best time is now.',
  'Quick check-in: how is your body doing today?',
  'A midday log can capture patterns you might forget by evening.',
];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface EncouragementPromptProps {
  onNavigate: (path: string) => void;
}

export default function EncouragementPrompt({ onNavigate }: EncouragementPromptProps) {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkActivity();
  }, [user]);

  const checkActivity = async () => {
    if (!user) return;

    const lastDismissed = localStorage.getItem(`gutwise_encourage_${user.id}`);
    if (lastDismissed) {
      const dismissedAt = new Date(lastDismissed);
      const hoursSince = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 12) return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    let totalToday = 0;
    const tables = ['bm_logs', 'food_logs', 'hydration_logs'];

    for (const table of tables) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('logged_at', todayISO);

      totalToday += count || 0;
    }

    if (totalToday === 0) {
      const hour = new Date().getHours();
      if (hour >= 10) {
        setMessage(pickRandom(nudgeMessages));
        setVisible(true);
      }
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    if (user) {
      localStorage.setItem(`gutwise_encourage_${user.id}`, new Date().toISOString());
    }
  };

  if (!visible) return null;

  return (
    <div
      className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4"
      style={{ animation: 'encouragementFade 0.3s ease-out both' }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900 mb-1">Time for a quick check-in?</p>
          <p className="text-xs text-amber-700 leading-relaxed">{message}</p>
          <button
            onClick={() => {
              handleDismiss();
              onNavigate('/bm-log');
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
          >
            Start logging
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg hover:bg-amber-100 transition-colors flex-shrink-0"
          aria-label="Dismiss encouragement"
        >
          <X className="h-4 w-4 text-amber-400" />
        </button>
      </div>
    </div>
  );
}

```

## ./src/components/Header.tsx

```
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top navigation">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-teal-600" />
            <span className="text-xl font-bold text-gray-900">GutWise</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

```

## ./src/components/InsightCard.tsx

```
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import { Insight } from '../utils/insightEngine';

interface InsightCardProps {
  insight: Insight;
}

export default function InsightCard({ insight }: InsightCardProps) {
  const confidenceColors = {
    low: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    medium: 'bg-blue-50 border-blue-200 text-blue-800',
    high: 'bg-green-50 border-green-200 text-green-800'
  };

  const confidenceIcons = {
    low: AlertCircle,
    medium: TrendingUp,
    high: Lightbulb
  };

  const ConfidenceIcon = confidenceIcons[insight.confidence_level];

  const getInsightTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sleep_symptom: 'Sleep-Symptom Pattern',
      stress_urgency: 'Stress Response Pattern',
      hydration_consistency: 'Hydration Pattern',
      food_symptom: 'Food-Symptom Pattern',
      temporal_pattern: 'Timing Pattern'
    };
    return labels[type] || type;
  };

  return (
    <div className={`rounded-lg border-2 p-6 transition-shadow hover:shadow-md ${confidenceColors[insight.confidence_level]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <ConfidenceIcon className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">
            {getInsightTypeLabel(insight.insight_type)}
          </span>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
          {insight.confidence_level.toUpperCase()}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
          <p className="text-gray-700 leading-relaxed">{insight.summary}</p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Evidence</h4>
          <div className="space-y-2 text-sm">
            {insight.evidence.frequency && (
              <p className="text-gray-700">
                <span className="font-medium">Frequency:</span> {insight.evidence.frequency}
              </p>
            )}
            {insight.evidence.correlation && (
              <p className="text-gray-700">
                <span className="font-medium">Correlation:</span> {insight.evidence.correlation}
              </p>
            )}
            {insight.evidence.dates && insight.evidence.dates.length > 0 && (
              <div className="text-gray-700">
                <span className="font-medium">Observed on:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {insight.evidence.dates.slice(0, 5).map((date, index) => (
                    <span key={index} className="px-2 py-0.5 bg-white/70 rounded text-xs">
                      {new Date(date).toLocaleDateString()}
                    </span>
                  ))}
                  {insight.evidence.dates.length > 5 && (
                    <span className="px-2 py-0.5 text-xs text-gray-600">
                      +{insight.evidence.dates.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-current/20">
          <p className="text-xs text-gray-600 italic">
            Confidence: {insight.confidence_level.charAt(0).toUpperCase() + insight.confidence_level.slice(1)}
            {' '}({insight.occurrence_count} {insight.occurrence_count === 1 ? 'occurrence' : 'occurrences'})
          </p>
        </div>
      </div>
    </div>
  );
}

```

## ./src/components/ProtectedRoute.tsx

```
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

```

## ./src/components/Sidebar.tsx

```
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Brain,
  UtensilsCrossed,
  FileText,
  Users,
  Settings,
  Menu,
  X,
  Activity,
  Droplet,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'BM Log', href: '/bm-log', icon: Droplet },
  { name: 'Health Insights', href: '/insights', icon: Brain },
  { name: 'Trends & Analytics', href: '/trends', icon: TrendingUp },
  { name: 'Meal Tracking', href: '/meals', icon: UtensilsCrossed },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setUserEmail(user.email || '');

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.full_name) {
          setDisplayName(profile.full_name);
        } else {
          const emailPrefix = user.email?.split('@')[0] || 'User';
          setDisplayName(emailPrefix);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const getInitial = () => {
    return displayName.charAt(0).toUpperCase() || 'U';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-gray-50 transition-colors"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-6 py-6 border-b border-gray-200">
            <Activity className="h-8 w-8 text-teal-600" />
            <span className="text-xl font-bold text-gray-900">GutWise</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" aria-label="Main navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                    transition-colors duration-150
                    ${active
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="px-6 py-4 border-t border-gray-200">
            <Link
              to="/account"
              className="flex items-center gap-3 px-2 rounded-lg hover:bg-gray-50 transition-colors duration-150"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                {getInitial()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

```

## ./src/components/StreakTracker.tsx

```
import { useState, useEffect } from 'react';
import { Flame, Calendar, CheckCircle } from 'lucide-react';
import Card from './Card';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getStreakCelebration } from '../utils/copySystem';

export default function StreakTracker() {
  const { user } = useAuth();
  const [streakDays, setStreakDays] = useState(0);
  const [loggedToday, setLoggedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      calculateStreak();
    }
  }, [user]);

  const calculateStreak = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let streak = 0;
      const checkDate = new Date(today);
      let hasLoggedToday = false;

      for (let i = 0; i < 400; i++) {
        const dayStart = new Date(checkDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(checkDate);
        dayEnd.setHours(23, 59, 59, 999);

        let dayHasLogs = false;
        const tables = ['bm_logs', 'food_logs', 'hydration_logs', 'symptom_logs', 'sleep_logs', 'stress_logs'];

        for (const table of tables) {
          const { count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('logged_at', dayStart.toISOString())
            .lte('logged_at', dayEnd.toISOString());

          if ((count || 0) > 0) {
            dayHasLogs = true;
            break;
          }
        }

        if (i === 0) {
          hasLoggedToday = dayHasLogs;
          if (dayHasLogs) {
            streak++;
          }
        } else if (dayHasLogs) {
          streak++;
        } else {
          break;
        }

        checkDate.setDate(checkDate.getDate() - 1);
      }

      setStreakDays(streak);
      setLoggedToday(hasLoggedToday);
    } catch {
      setStreakDays(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-200 rounded-lg" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-40" />
          </div>
        </div>
      </Card>
    );
  }

  if (streakDays === 0 && !loggedToday) {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">No streak yet</p>
            <p className="text-xs text-gray-500">Log something today to start building your streak.</p>
          </div>
        </div>
      </Card>
    );
  }

  const celebration = getStreakCelebration(streakDays);

  return (
    <Card className="border-teal-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            streakDays >= 7 ? 'bg-orange-100' : 'bg-teal-100'
          }`}>
            <Flame
              className={`h-5 w-5 ${streakDays >= 7 ? 'text-orange-500' : 'text-teal-600'}`}
              style={streakDays >= 7 ? { animation: 'flamePulse 2s ease-in-out infinite' } : undefined}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">
                {streakDays} day{streakDays !== 1 ? 's' : ''} streak
              </p>
              {loggedToday && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <CheckCircle className="h-3 w-3" />
                  Logged today
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {celebration || 'Keep logging daily to grow your streak.'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

```

## ./src/components/SuccessToast.tsx

```
import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export default function SuccessToast({
  message,
  visible,
  onDismiss,
  duration = 4000,
}: SuccessToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setExiting(false);
      return;
    }

    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onDismiss]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(onDismiss, 300);
  };

  if (!visible && !exiting) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full`}
      role="status"
      aria-live="polite"
      style={{
        animation: exiting
          ? 'toastSlideOut 0.3s ease-in forwards'
          : 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <div
            className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
            style={{ animation: 'toastCheckPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both' }}
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-medium text-gray-900 leading-snug">{message}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-green-500 rounded-full"
            style={{
              animation: `toastProgressShrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

```

## ./src/components/WelcomeBanner.tsx

```
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Activity, Utensils, Droplet, Moon, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface WelcomeBannerProps {
  userName: string;
}

interface OnboardingStep {
  key: string;
  label: string;
  icon: typeof Activity;
  path: string;
  table: string;
  done: boolean;
}

export default function WelcomeBanner({ userName }: WelcomeBannerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    { key: 'bm', label: 'Log a bowel movement', icon: Activity, path: '/bm-log', table: 'bm_logs', done: false },
    { key: 'food', label: 'Record a meal', icon: Utensils, path: '/food-log', table: 'food_logs', done: false },
    { key: 'hydration', label: 'Track hydration', icon: Droplet, path: '/hydration-log', table: 'hydration_logs', done: false },
    { key: 'sleep', label: 'Log your sleep', icon: Moon, path: '/sleep-log', table: 'sleep_logs', done: false },
  ]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    const dismissed = localStorage.getItem(`gutwise_welcome_${user.id}`);
    if (dismissed === 'done') return;

    const updated = [...steps];
    let allDone = true;

    for (const step of updated) {
      const { count } = await supabase
        .from(step.table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      step.done = (count || 0) > 0;
      if (!step.done) allDone = false;
    }

    if (allDone) {
      localStorage.setItem(`gutwise_welcome_${user.id}`, 'done');
      return;
    }

    setSteps(updated);
    setVisible(true);
  };

  const handleDismiss = () => {
    setVisible(false);
    if (user) {
      localStorage.setItem(`gutwise_welcome_${user.id}`, 'done');
    }
  };

  if (!visible) return null;

  const completedCount = steps.filter((s) => s.done).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div
      className="mb-6 bg-white rounded-xl border border-teal-200 shadow-sm overflow-hidden"
      style={{ animation: 'welcomeSlideDown 0.4s ease-out both' }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {userName ? `Welcome, ${userName}` : 'Welcome to GutWise'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Complete these steps to get the most out of your health tracking.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Dismiss welcome banner"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
          <div
            className="h-1.5 bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <button
                key={step.key}
                onClick={() => !step.done && navigate(step.path)}
                disabled={step.done}
                className={`p-3 rounded-lg border text-left transition-all ${
                  step.done
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 hover:border-teal-300 hover:bg-teal-50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {step.done ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Icon className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className={`text-xs font-medium leading-tight ${step.done ? 'text-green-700' : 'text-gray-700'}`}>
                  {step.done ? 'Done' : step.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

```

## ./src/components/dashboard/BMCountWidget.tsx

```
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from '../Card';

interface BMCountWidgetProps {
  count: number;
  loading: boolean;
}

export default function BMCountWidget({ count, loading }: BMCountWidgetProps) {
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  const getStatus = () => {
    if (count === 0) {
      return {
        message: 'No movements logged yet today',
        color: 'text-gray-600',
        icon: Minus,
        bgColor: 'bg-gray-100',
      };
    }
    if (count === 1) {
      return {
        message: 'Normal frequency',
        color: 'text-green-600',
        icon: TrendingUp,
        bgColor: 'bg-green-50',
      };
    }
    if (count === 2) {
      return {
        message: 'Healthy range',
        color: 'text-green-600',
        icon: TrendingUp,
        bgColor: 'bg-green-50',
      };
    }
    return {
      message: 'Above average',
      color: 'text-blue-600',
      icon: TrendingUp,
      bgColor: 'bg-blue-50',
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Bowel Movements</p>
          <p className="text-4xl font-bold text-gray-900">{count}</p>
        </div>
        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
          <Activity className="h-6 w-6 text-teal-600" />
        </div>
      </div>

      <div className={`flex items-center gap-2 ${status.bgColor} p-3 rounded-lg`}>
        <StatusIcon className={`h-4 w-4 ${status.color}`} />
        <span className={`text-sm font-medium ${status.color}`}>{status.message}</span>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>Typical range: 1-3 movements per day</p>
      </div>
    </Card>
  );
}

```

## ./src/components/dashboard/BristolScaleWidget.tsx

```
import { Droplets } from 'lucide-react';
import Card from '../Card';

interface BristolScaleWidgetProps {
  averageScale: number | null;
  count: number;
  loading: boolean;
}

export default function BristolScaleWidget({
  averageScale,
  count,
  loading,
}: BristolScaleWidgetProps) {
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  const getBristolInfo = (scale: number) => {
    const info = {
      1: { type: 'Type 1', desc: 'Hard lumps', color: 'bg-red-100 text-red-700', status: 'Constipation' },
      2: { type: 'Type 2', desc: 'Lumpy sausage', color: 'bg-orange-100 text-orange-700', status: 'Mild constipation' },
      3: { type: 'Type 3', desc: 'Cracked sausage', color: 'bg-green-100 text-green-700', status: 'Normal' },
      4: { type: 'Type 4', desc: 'Smooth snake', color: 'bg-green-100 text-green-700', status: 'Ideal' },
      5: { type: 'Type 5', desc: 'Soft blobs', color: 'bg-green-100 text-green-700', status: 'Normal' },
      6: { type: 'Type 6', desc: 'Mushy pieces', color: 'bg-yellow-100 text-yellow-700', status: 'Mild diarrhea' },
      7: { type: 'Type 7', desc: 'Liquid', color: 'bg-red-100 text-red-700', status: 'Diarrhea' },
    };

    const rounded = Math.round(scale);
    return info[rounded as keyof typeof info] || info[4];
  };

  if (count === 0 || averageScale === null) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Average Stool Type</p>
            <p className="text-4xl font-bold text-gray-300">--</p>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Droplets className="h-6 w-6 text-gray-400" />
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            No data logged yet today
          </p>
        </div>
      </Card>
    );
  }

  const bristolInfo = getBristolInfo(averageScale);
  const roundedScale = Math.round(averageScale * 10) / 10;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Average Stool Type</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-gray-900">{roundedScale}</p>
            <p className="text-sm text-gray-600">/ 7</p>
          </div>
        </div>
        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
          <Droplets className="h-6 w-6 text-amber-600" />
        </div>
      </div>

      <div className={`${bristolInfo.color} p-3 rounded-lg mb-3`}>
        <p className="text-sm font-semibold">{bristolInfo.type}</p>
        <p className="text-xs mt-1">{bristolInfo.desc}</p>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-xs font-medium text-gray-700">Status: {bristolInfo.status}</p>
        <p className="text-xs text-gray-600 mt-1">Based on {count} {count === 1 ? 'entry' : 'entries'} today</p>
      </div>

      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Bristol Scale</span>
          <span className="text-xs text-gray-500">1-7</span>
        </div>
        <div className="h-2 bg-gradient-to-r from-red-300 via-green-300 to-red-300 rounded-full relative">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900 rounded-full border-2 border-white shadow-lg"
            style={{ left: `${((averageScale - 1) / 6) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Constipation</span>
          <span className="text-xs text-gray-500">Ideal</span>
          <span className="text-xs text-gray-500">Diarrhea</span>
        </div>
      </div>
    </Card>
  );
}

```

## ./src/components/dashboard/HydrationWidget.tsx

```
import { Droplet, TrendingUp, CheckCircle } from 'lucide-react';
import Card from '../Card';

interface HydrationWidgetProps {
  totalMl: number;
  targetMl: number;
  entries: number;
  loading: boolean;
}

export default function HydrationWidget({
  totalMl,
  targetMl,
  entries,
  loading,
}: HydrationWidgetProps) {
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const percentage = Math.min((totalMl / targetMl) * 100, 100);
  const remainingMl = Math.max(targetMl - totalMl, 0);
  const cupsRemaining = Math.ceil(remainingMl / 250);
  const isComplete = totalMl >= targetMl;

  const getStatusColor = () => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getStatusMessage = () => {
    if (percentage >= 100) return 'Goal achieved!';
    if (percentage >= 75) return 'Almost there!';
    if (percentage >= 50) return 'Great progress!';
    if (percentage >= 25) return 'Keep going!';
    return 'Stay hydrated!';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Hydration Today</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-gray-900">
              {(totalMl / 1000).toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">/ {targetMl / 1000}L</p>
          </div>
        </div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isComplete ? 'bg-green-100' : 'bg-blue-100'
          }`}
        >
          {isComplete ? (
            <CheckCircle className="h-6 w-6 text-green-600" />
          ) : (
            <Droplet className="h-6 w-6 text-blue-600" />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all ${
              isComplete
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-blue-400 to-cyan-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className={`text-sm font-semibold ${getStatusColor()}`}>
            {Math.round(percentage)}% Complete
          </span>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </span>
        </div>

        {!isComplete ? (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-900">
                {remainingMl}ml to go
              </p>
            </div>
            <p className="text-xs text-blue-700">
              That's about {cupsRemaining} more {cupsRemaining === 1 ? 'cup' : 'cups'} of water
            </p>
          </div>
        ) : (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-green-900">
                Daily goal achieved! Well done!
              </p>
            </div>
            {totalMl > targetMl && (
              <p className="text-xs text-green-700 mt-1">
                You've exceeded your goal by {totalMl - targetMl}ml
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500">Logged</p>
            <p className="text-sm font-semibold text-gray-900">{entries}</p>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500">Average</p>
            <p className="text-sm font-semibold text-gray-900">
              {entries > 0 ? Math.round(totalMl / entries) : 0}ml
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

```

## ./src/components/dashboard/MedicationWidget.tsx

```
import { Pill, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../Card';

interface Medication {
  id: string;
  medication_name: string;
  dosage: string;
  logged_at: string;
  taken_as_prescribed: boolean;
}

interface MedicationWidgetProps {
  medications: Medication[];
  loading: boolean;
}

export default function MedicationWidget({
  medications,
  loading,
}: MedicationWidgetProps) {
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const adherenceRate =
    medications.length > 0
      ? (medications.filter((m) => m.taken_as_prescribed).length /
          medications.length) *
        100
      : 0;

  if (medications.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Medications Today
            </p>
            <p className="text-4xl font-bold text-gray-300">0</p>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Pill className="h-6 w-6 text-gray-400" />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">No medications logged today</p>
          <p className="text-xs text-gray-500 mt-1">
            Track your medications to monitor adherence
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">
            Medications Today
          </p>
          <p className="text-4xl font-bold text-gray-900">{medications.length}</p>
        </div>
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <Pill className="h-6 w-6 text-purple-600" />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Adherence Rate</span>
          <span className="text-sm font-bold text-gray-900">
            {Math.round(adherenceRate)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              adherenceRate === 100
                ? 'bg-green-500'
                : adherenceRate >= 80
                ? 'bg-blue-500'
                : 'bg-yellow-500'
            }`}
            style={{ width: `${adherenceRate}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {medications.map((med) => {
          const time = new Date(med.logged_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={med.id}
              className={`p-3 rounded-lg border transition-all ${
                med.taken_as_prescribed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {med.taken_as_prescribed ? (
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    )}
                    <p className="text-sm font-semibold text-gray-900">
                      {med.medication_name}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 ml-6">{med.dosage}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{time}</span>
                </div>
              </div>
              {!med.taken_as_prescribed && (
                <p className="text-xs text-yellow-700 mt-2 ml-6">
                  Not taken as prescribed
                </p>
              )}
            </div>
          );
        })}
      </div>

      {adherenceRate === 100 && (
        <div className="mt-4 bg-green-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-green-900 text-center">
            Perfect adherence today!
          </p>
        </div>
      )}
    </Card>
  );
}

```

## ./src/components/dashboard/PatternInsightsWidget.tsx

```
import { TrendingUp, Sparkles, Brain, Calendar } from 'lucide-react';
import Card from '../Card';

interface PatternInsightsWidgetProps {
  bmCount: number;
  symptomsCount: number;
  stressLevel: number | null;
  hydrationPercentage: number;
  loading: boolean;
}

export default function PatternInsightsWidget({
  bmCount,
  symptomsCount,
  stressLevel,
  hydrationPercentage,
  loading,
}: PatternInsightsWidgetProps) {
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const generateInsights = () => {
    const insights: Array<{
      icon: any;
      title: string;
      message: string;
      type: 'positive' | 'neutral' | 'suggestion';
    }> = [];

    if (hydrationPercentage >= 100) {
      insights.push({
        icon: Sparkles,
        title: 'Excellent Hydration',
        message: "You've met your hydration goal today! This helps maintain healthy digestion.",
        type: 'positive',
      });
    } else if (hydrationPercentage < 50) {
      insights.push({
        icon: TrendingUp,
        title: 'Hydration Reminder',
        message: 'Increase water intake to support digestive health and overall wellbeing.',
        type: 'suggestion',
      });
    }

    if (symptomsCount === 0 && bmCount > 0) {
      insights.push({
        icon: Sparkles,
        title: 'Symptom-Free Day',
        message: 'Great job! No symptoms logged today. Keep up your healthy routine.',
        type: 'positive',
      });
    }

    if (bmCount >= 1 && bmCount <= 3) {
      insights.push({
        icon: TrendingUp,
        title: 'Normal Bowel Pattern',
        message: 'Your bowel movement frequency is within the healthy range today.',
        type: 'positive',
      });
    }

    if (stressLevel !== null && stressLevel <= 4) {
      insights.push({
        icon: Brain,
        title: 'Low Stress Levels',
        message: 'Your stress levels are manageable today. This positively affects gut health.',
        type: 'positive',
      });
    } else if (stressLevel !== null && stressLevel >= 7) {
      insights.push({
        icon: Brain,
        title: 'Elevated Stress',
        message: 'High stress can affect digestion. Consider relaxation techniques today.',
        type: 'suggestion',
      });
    }

    if (insights.length === 0) {
      insights.push({
        icon: Calendar,
        title: 'Building Your Health Profile',
        message: 'Keep logging your health activities to unlock personalized insights and patterns.',
        type: 'neutral',
      });
    }

    return insights.slice(0, 3);
  };

  const insights = generateInsights();

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200';
      case 'suggestion':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getIconStyle = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'suggestion':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-600" />
            Health Insights
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Patterns and suggestions based on your data
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getInsightStyle(insight.type)} transition-all hover:shadow-sm`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getIconStyle(
                    insight.type
                  )}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {insight.title}
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-100">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-teal-600" />
          <p className="text-xs text-teal-900 font-medium">
            More insights unlock as you track consistently over time
          </p>
        </div>
      </div>
    </Card>
  );
}

```

## ./src/components/dashboard/SymptomSnapshotWidget.tsx

```
import { AlertCircle, CheckCircle, Activity } from 'lucide-react';
import Card from '../Card';
import { formatDateTime } from '../../utils/dateFormatters';

interface Symptom {
  symptom_type: string;
  severity: number;
  logged_at: string;
}

interface SymptomSnapshotWidgetProps {
  symptoms: Symptom[];
  loading: boolean;
}

export default function SymptomSnapshotWidget({
  symptoms,
  loading,
}: SymptomSnapshotWidgetProps) {
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-100 text-green-700 border-green-200';
    if (severity <= 6) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 3) return 'Mild';
    if (severity <= 6) return 'Moderate';
    return 'Severe';
  };

  if (symptoms.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Symptoms Today</p>
            <p className="text-4xl font-bold text-green-600">0</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg text-center">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
          <p className="text-sm font-medium text-green-900">Feeling great!</p>
          <p className="text-xs text-green-700 mt-1">No symptoms logged today</p>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Keep up the good work with your health routine</p>
        </div>
      </Card>
    );
  }

  const averageSeverity =
    symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length;
  const maxSeverity = Math.max(...symptoms.map((s) => s.severity));
  const mostRecent = symptoms[0];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Symptoms Today</p>
          <p className="text-4xl font-bold text-gray-900">{symptoms.length}</p>
        </div>
        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-orange-600" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Average Severity</span>
          <span className="text-sm font-bold text-gray-900">
            {averageSeverity.toFixed(1)}/10
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              averageSeverity <= 3
                ? 'bg-green-500'
                : averageSeverity <= 6
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${(averageSeverity / 10) * 100}%` }}
          />
        </div>

        <div
          className={`p-3 rounded-lg border ${getSeverityColor(maxSeverity)}`}
        >
          <p className="text-xs font-medium mb-1">Most Recent</p>
          <p className="text-sm font-semibold">{mostRecent.symptom_type}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs">
              {getSeverityLabel(mostRecent.severity)} ({mostRecent.severity}/10)
            </span>
            <span className="text-xs opacity-75">
              {new Date(mostRecent.logged_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {symptoms.length > 1 && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">
              <Activity className="inline h-3 w-3 mr-1" />
              {symptoms.length} symptoms logged today
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

```

## ./src/components/dashboard/TodaySummaryWidget.tsx

```
import { Sun, Moon, Utensils, Activity } from 'lucide-react';
import Card from '../Card';

interface TodaySummaryWidgetProps {
  bmCount: number;
  mealsCount: number;
  snacksCount: number;
  hydrationMl: number;
  sleepHours: number | null;
  loading: boolean;
  userName?: string; // Added: User's name to display in greeting
}

export default function TodaySummaryWidget({
  bmCount,
  mealsCount,
  snacksCount,
  hydrationMl,
  sleepHours,
  loading,
  userName, // Added: Destructure userName prop
}: TodaySummaryWidgetProps) {
  const totalFood = mealsCount + snacksCount;
  const hydrationLiters = (hydrationMl / 1000).toFixed(1);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: Sun };
    if (hour < 18) return { text: 'Good Afternoon', icon: Sun };
    return { text: 'Good Evening', icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-teal-100">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GreetingIcon className="h-6 w-6 text-teal-600" />
            {/* Display greeting with user's name if available */}
            {greeting.text}{userName ? `, ${userName}` : ''}
          </h2>
          <p className="text-sm text-gray-600 mt-1">Here's your health snapshot for today</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <Activity className="h-6 w-6 mx-auto mb-2 text-teal-600" />
          <p className="text-2xl font-bold text-gray-900">{bmCount}</p>
          <p className="text-xs text-gray-600 mt-1">BM Today</p>
        </div>

        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <Utensils className="h-6 w-6 mx-auto mb-2 text-orange-600" />
          <p className="text-2xl font-bold text-gray-900">{totalFood}</p>
          <p className="text-xs text-gray-600 mt-1">
            {mealsCount} meals, {snacksCount} snacks
          </p>
        </div>

        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <svg className="h-6 w-6 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="text-2xl font-bold text-gray-900">{hydrationLiters}L</p>
          <p className="text-xs text-gray-600 mt-1">Water Intake</p>
        </div>

        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <Moon className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
          <p className="text-2xl font-bold text-gray-900">
            {sleepHours !== null ? `${sleepHours}h` : '--'}
          </p>
          <p className="text-xs text-gray-600 mt-1">Last Sleep</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-teal-100 rounded-lg">
        <p className="text-sm text-teal-900 text-center">
          {bmCount > 0
            ? "Great job tracking your health today!"
            : "Start logging your health activities to see insights here"}
        </p>
      </div>
    </Card>
  );
}

```

## ./src/components/reports/BMAnalyticsSection.tsx

```
import { BMAnalytics } from '../../utils/clinicalReportQueries';

interface BMAnalyticsSectionProps {
  analytics: BMAnalytics;
}

export default function BMAnalyticsSection({ analytics }: BMAnalyticsSectionProps) {
  const { totalCount, averagePerDay, averagePerWeek, confidenceInterval } = analytics;

  const isWithinNormalRange = averagePerDay >= 1 && averagePerDay <= 3;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Bowel Movement Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Count</p>
          <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Average per Day</p>
          <p className="text-3xl font-bold text-gray-900">{averagePerDay.toFixed(2)}</p>
          {!isWithinNormalRange && (
            <p className="text-xs text-red-600 font-medium mt-1">Outside normal range (1-3/day)</p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Average per Week</p>
          <p className="text-3xl font-bold text-gray-900">{averagePerWeek.toFixed(1)}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">95% Confidence Interval</p>
          <p className="text-xl font-bold text-gray-900">
            {confidenceInterval.lower.toFixed(2)} - {confidenceInterval.upper.toFixed(2)}
          </p>
          <p className="text-xs text-gray-600 mt-1">per day</p>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Clinical Interpretation</h3>
        <p className="text-sm text-blue-800 leading-relaxed">
          {isWithinNormalRange ? (
            <>
              Bowel movement frequency is within the normal physiological range of 1-3 movements per day.
              Statistical analysis demonstrates consistent elimination patterns with 95% confidence.
            </>
          ) : averagePerDay < 1 ? (
            <>
              Reduced bowel movement frequency below expected range. Consider evaluation for constipation,
              reduced GI motility, or structural abnormalities. Differential includes medication effects,
              dietary factors, or underlying metabolic disorders.
            </>
          ) : (
            <>
              Elevated bowel movement frequency exceeding normal parameters. Clinical correlation recommended
              to assess for infectious gastroenteritis, inflammatory bowel disease, malabsorption syndromes,
              or hypermotility disorders.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

```

## ./src/components/reports/BristolDistributionSection.tsx

```
import { BristolDistribution } from '../../utils/clinicalReportQueries';

interface BristolDistributionSectionProps {
  distribution: BristolDistribution[];
}

const bristolDescriptions: { [key: number]: { label: string; clinical: string } } = {
  1: { label: 'Type 1: Separate hard lumps', clinical: 'Severe constipation' },
  2: { label: 'Type 2: Lumpy and sausage-like', clinical: 'Mild constipation' },
  3: { label: 'Type 3: Sausage-shaped with cracks', clinical: 'Normal (optimal)' },
  4: { label: 'Type 4: Smooth, soft sausage', clinical: 'Normal (optimal)' },
  5: { label: 'Type 5: Soft blobs with clear edges', clinical: 'Lacking fiber' },
  6: { label: 'Type 6: Mushy consistency', clinical: 'Mild diarrhea' },
  7: { label: 'Type 7: Liquid consistency', clinical: 'Severe diarrhea' },
};

export default function BristolDistributionSection({ distribution }: BristolDistributionSectionProps) {
  const maxPercentage = Math.max(...distribution.map(d => d.percentage), 1);
  const hasData = distribution.length > 0;

  const normalTypes = distribution.filter(d => d.type === 3 || d.type === 4);
  const normalPercentage = normalTypes.reduce((sum, d) => sum + d.percentage, 0);
  const isPredominallyNormal = normalPercentage > 60;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Bristol Stool Scale Distribution
      </h2>

      {!hasData ? (
        <p className="text-gray-600 italic">No stool type data recorded during this period.</p>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {[1, 2, 3, 4, 5, 6, 7].map(type => {
              const data = distribution.find(d => d.type === type);
              const percentage = data?.percentage || 0;
              const count = data?.count || 0;
              const barWidth = maxPercentage > 0 ? (percentage / maxPercentage) * 100 : 0;
              const isNormal = type === 3 || type === 4;

              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">
                      {bristolDescriptions[type].label}
                    </span>
                    <span className="text-gray-600">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isNormal
                          ? 'bg-green-500'
                          : type < 3
                          ? 'bg-amber-500'
                          : 'bg-orange-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 italic">
                    {bristolDescriptions[type].clinical}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 border-l-4 border-gray-600 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Clinical Assessment</h3>
            <p className="text-sm text-gray-800 leading-relaxed">
              {isPredominallyNormal ? (
                <>
                  Stool consistency predominantly within normal parameters (Types 3-4: {normalPercentage.toFixed(1)}%).
                  Bristol Scale distribution suggests adequate hydration, fiber intake, and normal colonic transit time.
                  Continue current management regimen.
                </>
              ) : (
                <>
                  Stool consistency demonstrates deviation from optimal Bristol Types 3-4 ({normalPercentage.toFixed(1)}% normal).
                  Consider comprehensive evaluation of dietary fiber intake, fluid balance, medication effects, and
                  underlying gastrointestinal motility disorders. Therapeutic intervention may be warranted.
                </>
              )}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-700">Normal (Types 3-4)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded"></div>
                <span className="text-gray-700">Constipation (Types 1-2)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-gray-700">Diarrhea (Types 5-7)</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

```

## ./src/components/reports/ClinicalAlertsSection.tsx

```
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { ClinicalAlert } from '../../utils/clinicalReportQueries';

interface ClinicalAlertsSectionProps {
  alerts: ClinicalAlert[];
}

export default function ClinicalAlertsSection({ alerts }: ClinicalAlertsSectionProps) {
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const highAlerts = alerts.filter(a => a.severity === 'high');
  const mediumAlerts = alerts.filter(a => a.severity === 'medium');
  const lowAlerts = alerts.filter(a => a.severity === 'low');

  const hasAlerts = alerts.length > 0;

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-6 w-6" />;
      case 'medium':
        return <AlertCircle className="h-6 w-6" />;
      default:
        return <Info className="h-6 w-6" />;
    }
  };

  const getAlertStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          container: 'bg-red-100 border-red-600',
          icon: 'text-red-700',
          badge: 'bg-red-700 text-white',
          text: 'text-red-900',
          title: 'text-red-900',
        };
      case 'high':
        return {
          container: 'bg-orange-100 border-orange-600',
          icon: 'text-orange-700',
          badge: 'bg-orange-700 text-white',
          text: 'text-orange-900',
          title: 'text-orange-900',
        };
      case 'medium':
        return {
          container: 'bg-yellow-100 border-yellow-600',
          icon: 'text-yellow-700',
          badge: 'bg-yellow-700 text-white',
          text: 'text-yellow-900',
          title: 'text-yellow-900',
        };
      default:
        return {
          container: 'bg-blue-100 border-blue-600',
          icon: 'text-blue-700',
          badge: 'bg-blue-700 text-white',
          text: 'text-blue-900',
          title: 'text-blue-900',
        };
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Clinical Alert System
      </h2>

      {!hasAlerts ? (
        <div className="bg-green-50 border-l-4 border-green-600 p-4">
          <p className="text-green-800 font-medium">
            No clinical alerts triggered during the reporting period. All monitored parameters within acceptable ranges.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-700">
                Total Alerts: <span className="font-bold text-gray-900">{alerts.length}</span>
              </span>
              {criticalAlerts.length > 0 && (
                <span className="text-red-700">
                  Critical: <span className="font-bold">{criticalAlerts.length}</span>
                </span>
              )}
              {highAlerts.length > 0 && (
                <span className="text-orange-700">
                  High: <span className="font-bold">{highAlerts.length}</span>
                </span>
              )}
              {mediumAlerts.length > 0 && (
                <span className="text-yellow-700">
                  Medium: <span className="font-bold">{mediumAlerts.length}</span>
                </span>
              )}
              {lowAlerts.length > 0 && (
                <span className="text-blue-700">
                  Low: <span className="font-bold">{lowAlerts.length}</span>
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {alerts.map((alert, idx) => {
              const style = getAlertStyle(alert.severity);

              return (
                <div
                  key={idx}
                  className={`border-l-4 rounded-r-lg p-4 ${style.container}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 ${style.icon}`}>
                      {getAlertIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`text-lg font-bold ${style.title}`}>
                          {alert.message}
                        </h3>
                        <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${style.badge}`}>
                          {alert.severity}
                        </span>
                      </div>

                      <p className={`text-sm leading-relaxed mb-3 ${style.text}`}>
                        {alert.details}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-gray-700">Affected Dates:</span>
                        {alert.affectedDates.slice(0, 5).map((date, dateIdx) => (
                          <span
                            key={dateIdx}
                            className="text-xs bg-white bg-opacity-60 px-2 py-1 rounded text-gray-800 font-medium"
                          >
                            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        ))}
                        {alert.affectedDates.length > 5 && (
                          <span className="text-xs text-gray-700 font-medium">
                            +{alert.affectedDates.length - 5} more
                          </span>
                        )}
                      </div>

                      {alert.severity === 'critical' && (
                        <div className="mt-3 pt-3 border-t border-red-300">
                          <p className="text-sm font-bold text-red-900">
                            ⚠ URGENT: This finding requires immediate clinical attention and may warrant emergency evaluation.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 bg-gray-50 border border-gray-300 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Alert Severity Classification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-semibold text-red-700">CRITICAL:</span>
                <span className="text-gray-700"> Requires immediate evaluation within 24 hours. May indicate life-threatening condition.</span>
              </div>
              <div>
                <span className="font-semibold text-orange-700">HIGH:</span>
                <span className="text-gray-700"> Requires prompt clinical assessment within 48-72 hours. Significant concern warranting intervention.</span>
              </div>
              <div>
                <span className="font-semibold text-yellow-700">MEDIUM:</span>
                <span className="text-gray-700"> Should be addressed at next scheduled appointment. Moderate clinical concern.</span>
              </div>
              <div>
                <span className="font-semibold text-blue-700">LOW:</span>
                <span className="text-gray-700"> Minor finding for clinical awareness. No urgent action required.</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

```

## ./src/components/reports/DateRangeSelector.tsx

```
import { Calendar } from 'lucide-react';
import Button from '../Button';

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

export default function DateRangeSelector({ startDate, endDate, onDateRangeChange }: DateRangeSelectorProps) {
  const handlePresetRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    onDateRangeChange(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 print:border-0 print:p-0">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Report Period</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onDateRangeChange(e.target.value, endDate)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onDateRangeChange(startDate, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="print:hidden">
        <p className="text-sm text-gray-600 mb-2">Quick Select:</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetRange(7)}
          >
            Last 7 Days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetRange(30)}
          >
            Last 30 Days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetRange(90)}
          >
            Last 90 Days
          </Button>
        </div>
      </div>
    </div>
  );
}

```

## ./src/components/reports/ExecutiveSummary.tsx

```
import { AlertTriangle } from 'lucide-react';
import { ClinicalAlert } from '../../utils/clinicalReportQueries';

interface ExecutiveSummaryProps {
  dateRange: string;
  totalBMs: number;
  avgPerDay: number;
  avgPerWeek: number;
  criticalAlerts: ClinicalAlert[];
  primaryConcerns: string[];
}

export default function ExecutiveSummary({
  dateRange,
  totalBMs,
  avgPerDay,
  avgPerWeek,
  criticalAlerts,
  primaryConcerns,
}: ExecutiveSummaryProps) {
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6 print:border-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-gray-200">
        Executive Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Report Period</p>
          <p className="text-lg font-semibold text-gray-900">{dateRange}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Total Bowel Movements</p>
          <p className="text-lg font-semibold text-gray-900">{totalBMs}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Daily Average</p>
          <p className="text-lg font-semibold text-gray-900">
            {avgPerDay.toFixed(2)} per day / {avgPerWeek.toFixed(2)} per week
          </p>
        </div>
      </div>

      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Clinical Alerts ({criticalAlerts.length})
              </h3>
              <ul className="space-y-2">
                {criticalAlerts.map((alert, idx) => (
                  <li key={idx} className="text-sm text-red-800">
                    <span className="font-semibold uppercase tracking-wide text-xs bg-red-200 px-2 py-1 rounded mr-2">
                      {alert.severity}
                    </span>
                    {alert.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {primaryConcerns.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Clinical Observations</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-800">
            {primaryConcerns.map((concern, idx) => (
              <li key={idx} className="leading-relaxed">{concern}</li>
            ))}
          </ul>
        </div>
      )}

      {primaryConcerns.length === 0 && criticalAlerts.length === 0 && (
        <div className="bg-green-50 border-l-4 border-green-600 p-4">
          <p className="text-green-800 font-medium">
            No critical concerns identified during the reporting period. Patient data within expected parameters.
          </p>
        </div>
      )}
    </div>
  );
}

```

## ./src/components/reports/HealthMarkersSection.tsx

```
import { HealthMarkerCorrelation } from '../../utils/clinicalReportQueries';

interface HealthMarkersSectionProps {
  correlations: HealthMarkerCorrelation[];
}

export default function HealthMarkersSection({ correlations }: HealthMarkersSectionProps) {
  const hasData = correlations.length > 0 && correlations.some(c =>
    c.sleepQuality !== null || c.stressLevel !== null || c.symptomSeverity !== null
  );

  const calculateCorrelation = () => {
    const validData = correlations.filter(c =>
      c.sleepQuality !== null && c.symptomSeverity !== null
    );

    if (validData.length < 3) return null;

    const avgSleep = validData.reduce((sum, d) => sum + (d.sleepQuality || 0), 0) / validData.length;
    const avgSymptom = validData.reduce((sum, d) => sum + (d.symptomSeverity || 0), 0) / validData.length;

    let numerator = 0;
    let denomSleep = 0;
    let denomSymptom = 0;

    validData.forEach(d => {
      const sleepDiff = (d.sleepQuality || 0) - avgSleep;
      const symptomDiff = (d.symptomSeverity || 0) - avgSymptom;
      numerator += sleepDiff * symptomDiff;
      denomSleep += sleepDiff * sleepDiff;
      denomSymptom += symptomDiff * symptomDiff;
    });

    if (denomSleep === 0 || denomSymptom === 0) return null;

    const correlation = numerator / Math.sqrt(denomSleep * denomSymptom);
    return correlation;
  };

  const sleepCorrelation = calculateCorrelation();

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Contextual Health Markers
      </h2>

      {!hasData ? (
        <p className="text-gray-600 italic">No contextual health marker data recorded during this period.</p>
      ) : (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Date</th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-900">Sleep Quality</th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-900">Stress Level</th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-900">Symptom Severity</th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-900">BM Count</th>
                </tr>
              </thead>
              <tbody>
                {correlations.map((corr, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-2 text-gray-900">
                      {new Date(corr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="text-center py-3 px-2">
                      {corr.sleepQuality !== null ? (
                        <span className={`inline-flex items-center justify-center w-12 h-8 rounded ${
                          corr.sleepQuality >= 7 ? 'bg-green-100 text-green-800' :
                          corr.sleepQuality >= 4 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        } font-semibold`}>
                          {corr.sleepQuality}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-2">
                      {corr.stressLevel !== null ? (
                        <span className={`inline-flex items-center justify-center w-12 h-8 rounded ${
                          corr.stressLevel >= 7 ? 'bg-red-100 text-red-800' :
                          corr.stressLevel >= 4 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        } font-semibold`}>
                          {corr.stressLevel}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-2">
                      {corr.symptomSeverity !== null ? (
                        <span className={`inline-flex items-center justify-center w-12 h-8 rounded ${
                          corr.symptomSeverity >= 7 ? 'bg-red-100 text-red-800' :
                          corr.symptomSeverity >= 4 ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        } font-semibold`}>
                          {corr.symptomSeverity.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-2 font-semibold text-gray-900">
                      {corr.bmCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sleepCorrelation !== null && (
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Sleep-Symptom Correlation Analysis</h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                Pearson correlation coefficient: <span className="font-bold">{sleepCorrelation.toFixed(3)}</span>.
                {sleepCorrelation < -0.5 ? (
                  <> Strong negative correlation detected between sleep quality and symptom severity. Poor sleep hygiene
                  appears to be a significant contributing factor to symptom exacerbation. Sleep optimization should be
                  prioritized in treatment plan.</>
                ) : sleepCorrelation < -0.3 ? (
                  <> Moderate negative correlation observed between sleep quality and symptom severity. Sleep disturbances
                  may contribute to symptom presentation. Consider addressing sleep hygiene as part of comprehensive management.</>
                ) : (
                  <> Weak or no significant correlation between sleep quality and symptom severity. Sleep does not appear
                  to be a primary driver of symptom variability in this patient.</>
                )}
              </p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Note:</span> All values on 0-10 scale unless otherwise specified.
              Higher sleep quality indicates better rest. Higher stress/symptom values indicate increased severity.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

```

## ./src/components/reports/MedicationCorrelationSection.tsx

```
import { Pill, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { MedicationCorrelation } from '../../utils/clinicalReportQueries';

interface MedicationCorrelationSectionProps {
  correlations: MedicationCorrelation[];
}

export default function MedicationCorrelationSection({ correlations }: MedicationCorrelationSectionProps) {
  const hasData = correlations.length > 0;

  const getMedicationResponse = (before: number | null, after: number | null) => {
    if (before === null || after === null) return { type: 'unknown', change: 0 };

    const change = after - before;
    if (change < -1) return { type: 'positive', change };
    if (change > 1) return { type: 'negative', change };
    return { type: 'neutral', change };
  };

  const medicationGroups = correlations.reduce((acc, corr) => {
    if (!acc[corr.medicationName]) {
      acc[corr.medicationName] = [];
    }
    acc[corr.medicationName].push(corr);
    return acc;
  }, {} as { [key: string]: MedicationCorrelation[] });

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Medication Correlation Timeline
      </h2>

      {!hasData ? (
        <p className="text-gray-600 italic">No medication data recorded during this period.</p>
      ) : (
        <>
          <div className="space-y-6">
            {Object.entries(medicationGroups).map(([medicationName, meds]) => {
              const responses = meds.map(m => getMedicationResponse(m.symptomSeverityBefore, m.symptomSeverityAfter));
              const positiveResponses = responses.filter(r => r.type === 'positive').length;
              const negativeResponses = responses.filter(r => r.type === 'negative').length;
              const avgChange = responses
                .filter(r => r.type !== 'unknown')
                .reduce((sum, r) => sum + r.change, 0) / Math.max(1, responses.filter(r => r.type !== 'unknown').length);

              return (
                <div key={medicationName} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Pill className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{medicationName}</h3>
                        <p className="text-sm text-gray-600">
                          {meds.length} administration{meds.length !== 1 ? 's' : ''} recorded
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        positiveResponses > negativeResponses ? 'bg-green-100 text-green-800' :
                        negativeResponses > positiveResponses ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {positiveResponses > negativeResponses ? 'Therapeutic Benefit' :
                         negativeResponses > positiveResponses ? 'Limited Efficacy' :
                         'Variable Response'}
                      </div>
                      {avgChange !== 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          Avg change: {avgChange > 0 ? '+' : ''}{avgChange.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {meds.map((med, idx) => {
                      const response = getMedicationResponse(med.symptomSeverityBefore, med.symptomSeverityAfter);

                      return (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-900">
                                {new Date(med.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <span className="text-sm text-gray-600">{med.timeTaken}</span>
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                {med.dosage}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {response.type === 'positive' && (
                                <>
                                  <TrendingDown className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-semibold text-green-700">
                                    {Math.abs(response.change).toFixed(1)} improvement
                                  </span>
                                </>
                              )}
                              {response.type === 'negative' && (
                                <>
                                  <TrendingUp className="h-4 w-4 text-red-600" />
                                  <span className="text-sm font-semibold text-red-700">
                                    +{Math.abs(response.change).toFixed(1)} worsening
                                  </span>
                                </>
                              )}
                              {response.type === 'neutral' && (
                                <>
                                  <Minus className="h-4 w-4 text-gray-600" />
                                  <span className="text-sm font-semibold text-gray-700">No change</span>
                                </>
                              )}
                              {response.type === 'unknown' && (
                                <span className="text-sm text-gray-500 italic">Insufficient data</span>
                              )}
                            </div>
                          </div>

                          {med.symptomSeverityBefore !== null && med.symptomSeverityAfter !== null && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span>Pre-dose: <span className="font-semibold text-gray-900">{med.symptomSeverityBefore.toFixed(1)}</span></span>
                              <span>→</span>
                              <span>Post-dose (4h): <span className="font-semibold text-gray-900">{med.symptomSeverityAfter.toFixed(1)}</span></span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className={`text-sm p-3 rounded border-l-4 ${
                    positiveResponses > negativeResponses
                      ? 'bg-green-50 border-green-600 text-green-900'
                      : negativeResponses > positiveResponses
                      ? 'bg-red-50 border-red-600 text-red-900'
                      : 'bg-gray-50 border-gray-600 text-gray-900'
                  }`}>
                    <span className="font-semibold">Clinical Assessment: </span>
                    {positiveResponses > negativeResponses ? (
                      <>
                        Medication demonstrates consistent therapeutic efficacy with symptom reduction in majority
                        of administrations ({positiveResponses}/{meds.length}). Current regimen appears appropriate.
                      </>
                    ) : negativeResponses > positiveResponses ? (
                      <>
                        Limited therapeutic benefit observed with potential symptom exacerbation noted in
                        {negativeResponses}/{meds.length} administrations. Consider dose adjustment, timing modification,
                        or alternative pharmacologic intervention.
                      </>
                    ) : (
                      <>
                        Variable response pattern suggests inconsistent efficacy. May indicate need for dose optimization,
                        evaluation of medication timing relative to meals, or assessment of drug-drug interactions.
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Temporal Analysis Methodology</h3>
            <p className="text-xs text-blue-800 leading-relaxed">
              Pre-dose severity represents average symptom intensity 2 hours prior to medication administration.
              Post-dose severity represents average symptom intensity 4 hours following administration. This temporal
              window captures peak pharmacologic effect for most GI medications. Improvement ≥1 point considered
              clinically significant.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

```

## ./src/components/reports/SymptomProgressionSection.tsx

```
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SymptomTrend } from '../../utils/clinicalReportQueries';

interface SymptomProgressionSectionProps {
  trends: SymptomTrend[];
}

export default function SymptomProgressionSection({ trends }: SymptomProgressionSectionProps) {
  const symptomTypes = Array.from(new Set(trends.map(t => t.symptomType)));

  const getSymptomData = (symptomType: string) => {
    const symptomTrends = trends.filter(t => t.symptomType === symptomType).sort((a, b) => a.date.localeCompare(b.date));
    if (symptomTrends.length < 2) return { trend: 'stable', change: 0, first: 0, last: 0, avg: 0 };

    const first = symptomTrends[0].avgSeverity;
    const last = symptomTrends[symptomTrends.length - 1].avgSeverity;
    const avg = symptomTrends.reduce((sum, t) => sum + t.avgSeverity, 0) / symptomTrends.length;
    const change = last - first;

    let trend: 'improving' | 'worsening' | 'stable' = 'stable';
    if (change < -0.5) trend = 'improving';
    else if (change > 0.5) trend = 'worsening';

    return { trend, change, first, last, avg };
  };

  const hasData = trends.length > 0;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Symptom Progression Analysis
      </h2>

      {!hasData ? (
        <p className="text-gray-600 italic">No symptom data recorded during this period.</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {symptomTypes.map(symptomType => {
              const data = getSymptomData(symptomType);
              const symptomTrends = trends.filter(t => t.symptomType === symptomType);
              const maxSeverity = Math.max(...symptomTrends.map(t => t.avgSeverity));

              return (
                <div key={symptomType} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{symptomType}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Average Severity: <span className="font-semibold text-gray-900">{data.avg.toFixed(1)}/10</span>
                        </span>
                        <span className="text-gray-600">
                          Occurrences: <span className="font-semibold text-gray-900">{symptomTrends.length}</span>
                        </span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      data.trend === 'improving' ? 'bg-green-100 text-green-800' :
                      data.trend === 'worsening' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {data.trend === 'improving' && <TrendingDown className="h-5 w-5" />}
                      {data.trend === 'worsening' && <TrendingUp className="h-5 w-5" />}
                      {data.trend === 'stable' && <Minus className="h-5 w-5" />}
                      <span className="font-semibold capitalize">{data.trend}</span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    {symptomTrends.map((trend, idx) => {
                      const barHeight = maxSeverity > 0 ? (trend.avgSeverity / maxSeverity) * 100 : 0;
                      const severityColor = trend.avgSeverity >= 7 ? 'bg-red-500' :
                                          trend.avgSeverity >= 4 ? 'bg-orange-500' :
                                          'bg-yellow-500';

                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 w-24 flex-shrink-0">
                            {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${severityColor} transition-all`}
                              style={{ width: `${barHeight}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-900 w-12 text-right">
                            {trend.avgSeverity.toFixed(1)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {data.trend !== 'stable' && (
                    <div className={`text-sm p-3 rounded ${
                      data.trend === 'improving' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {data.trend === 'improving' ? (
                        <>
                          <span className="font-semibold">Positive Response:</span> Symptom severity decreased by {Math.abs(data.change).toFixed(1)} points
                          from {data.first.toFixed(1)} to {data.last.toFixed(1)}. Current therapeutic approach demonstrating efficacy.
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">Clinical Deterioration:</span> Symptom severity increased by {Math.abs(data.change).toFixed(1)} points
                          from {data.first.toFixed(1)} to {data.last.toFixed(1)}. Consider escalation of treatment or alternative therapeutic strategy.
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-6 text-xs border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-700">Severe (7-10)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-gray-700">Moderate (4-6)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-gray-700">Mild (1-3)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

```

## ./src/components/reports/TriggerPatternsSection.tsx

```
import { AlertCircle } from 'lucide-react';
import { TriggerPattern } from '../../utils/clinicalReportQueries';

interface TriggerPatternsSectionProps {
  triggers: TriggerPattern[];
}

export default function TriggerPatternsSection({ triggers }: TriggerPatternsSectionProps) {
  const hasData = triggers.length > 0;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Trigger Pattern Analysis
      </h2>

      {!hasData ? (
        <p className="text-gray-600 italic">
          Insufficient data to identify statistically significant trigger patterns. Continued logging recommended
          for pattern recognition analysis.
        </p>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              The following dietary items demonstrate statistically significant correlation with symptom occurrence
              (correlation strength &gt;0.3). Listed in descending order of correlation strength.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {triggers.map((trigger, idx) => {
              const correlationPercentage = trigger.correlationStrength * 100;
              const isHighRisk = trigger.correlationStrength > 0.6;
              const isMediumRisk = trigger.correlationStrength > 0.4;

              return (
                <div
                  key={idx}
                  className={`border-l-4 p-4 rounded-r-lg ${
                    isHighRisk ? 'border-red-600 bg-red-50' :
                    isMediumRisk ? 'border-orange-500 bg-orange-50' :
                    'border-yellow-500 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isHighRisk && <AlertCircle className="h-5 w-5 text-red-600" />}
                        <h3 className="text-lg font-semibold text-gray-900">{trigger.trigger}</h3>
                      </div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-2">
                        {trigger.category} trigger
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        isHighRisk ? 'text-red-700' :
                        isMediumRisk ? 'text-orange-700' :
                        'text-yellow-700'
                      }`}>
                        {correlationPercentage.toFixed(0)}%
                      </div>
                      <p className="text-xs text-gray-600">correlation</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Occurrences</p>
                      <p className="font-semibold text-gray-900">{trigger.occurrences}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Avg Symptom Severity</p>
                      <p className="font-semibold text-gray-900">
                        {trigger.avgSymptomSeverity.toFixed(1)}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Risk Level</p>
                      <p className={`font-semibold ${
                        isHighRisk ? 'text-red-700' :
                        isMediumRisk ? 'text-orange-700' :
                        'text-yellow-700'
                      }`}>
                        {isHighRisk ? 'High' : isMediumRisk ? 'Medium' : 'Low'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">Clinical Recommendation:</span>
                      {isHighRisk ? (
                        <> Strong temporal association between consumption and symptom manifestation.
                        Recommend strict elimination and formal challenge testing under medical supervision
                        to establish causality.</>
                      ) : isMediumRisk ? (
                        <> Moderate correlation suggests potential trigger. Consider elimination trial for
                        2-4 weeks with symptom monitoring to assess clinical response.</>
                      ) : (
                        <> Weak-to-moderate association observed. May warrant dietary modification if other
                        interventions fail to provide adequate symptom control.</>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Methodology Note</h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              Trigger analysis evaluates temporal correlation between dietary intake and symptom occurrence within
              an 8-hour post-consumption window. Correlation strength represents the proportion of exposures followed
              by symptomatic events. Values &gt;0.6 indicate high likelihood of causative relationship. Analysis requires
              minimum 3 exposures for statistical validity.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

```

## ./src/components/trends/BMFrequencyChart.tsx

```
import { BMFrequencyData } from '../../hooks/useTrendsData';

interface BMFrequencyChartProps {
  data: BMFrequencyData[];
}

export default function BMFrequencyChart({ data }: BMFrequencyChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No bowel movement data available for this period
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const avgFrequency = (data.reduce((sum, d) => sum + d.count, 0) / data.length).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Daily Frequency Trend</h3>
        <div className="text-sm text-gray-600">
          Avg: <span className="font-semibold text-blue-600">{avgFrequency}</span> per day
        </div>
      </div>

      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {data.map((item, index) => {
            const heightPercent = (item.count / maxCount) * 100;
            const date = new Date(item.date);
            const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600 cursor-pointer"
                    style={{ height: `${Math.max(heightPercent, 3)}px` }}
                    title={`${dateLabel}: ${item.count} BM${item.count !== 1 ? 's' : ''}`}
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {item.count} BM{item.count !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600 rotate-0 text-center">
                  {index % Math.ceil(data.length / 7) === 0 ? dateLabel : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
        <span>0 BMs</span>
        <span>{maxCount} BMs</span>
      </div>
    </div>
  );
}

```

## ./src/components/trends/BristolDistributionChart.tsx

```
import { BristolDistribution } from '../../hooks/useTrendsData';

interface BristolDistributionChartProps {
  data: BristolDistribution[];
}

const bristolLabels: Record<number, string> = {
  1: 'Separate hard lumps',
  2: 'Lumpy and sausage-like',
  3: 'Sausage with cracks',
  4: 'Smooth, soft sausage',
  5: 'Soft blobs with clear edges',
  6: 'Mushy consistency',
  7: 'Liquid consistency',
};

const bristolColors: Record<number, string> = {
  1: '#8B4513',
  2: '#A0522D',
  3: '#CD853F',
  4: '#DEB887',
  5: '#F4A460',
  6: '#DAA520',
  7: '#FFA500',
};

export default function BristolDistributionChart({ data }: BristolDistributionChartProps) {
  const hasData = data.some(d => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No Bristol Scale data available for this period
      </div>
    );
  }

  const maxPercentage = Math.max(...data.map(d => d.percentage));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Bristol Stool Scale Distribution</h3>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.type} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 w-6">Type {item.type}</span>
                <span className="text-gray-600 text-xs">{bristolLabels[item.type]}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">{item.count}</span>
                <span className="font-semibold text-gray-900 w-12 text-right">{item.percentage}%</span>
              </div>
            </div>
            <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 flex items-center justify-end px-2"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: bristolColors[item.type],
                }}
              >
                {item.percentage > 10 && (
                  <span className="text-xs font-medium text-white">
                    {item.percentage}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Ideal range:</strong> Types 3-4 indicate normal, healthy stools
        </p>
      </div>
    </div>
  );
}

```

## ./src/components/trends/HydrationCorrelationChart.tsx

```
import { HydrationCorrelation } from '../../hooks/useTrendsData';

interface HydrationCorrelationChartProps {
  data: HydrationCorrelation[];
}

export default function HydrationCorrelationChart({ data }: HydrationCorrelationChartProps) {
  const hasData = data.some(d => d.totalHydration > 0 || d.avgBristolScale !== null);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No hydration or stool data available for this period
      </div>
    );
  }

  const maxHydration = Math.max(...data.map(d => d.totalHydration), 1);
  const chartHeight = 240;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Hydration vs Stool Consistency</h3>

      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {data.map((item, index) => {
            const hydrationHeight = (item.totalHydration / maxHydration) * (chartHeight - 60);
            const bristolScale = item.avgBristolScale;
            const date = new Date(item.date);
            const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            let bristolColor = '#D1D5DB';
            if (bristolScale) {
              if (bristolScale <= 2) bristolColor = '#8B4513';
              else if (bristolScale <= 4) bristolColor = '#10B981';
              else if (bristolScale <= 5) bristolColor = '#F59E0B';
              else bristolColor = '#EF4444';
            }

            return (
              <div key={index} className="flex-1 flex flex-col items-center group relative">
                <div className="w-full flex flex-col items-center gap-1">
                  {bristolScale !== null && (
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: bristolColor }}
                      title={`Bristol Scale: ${bristolScale.toFixed(1)}`}
                    />
                  )}
                  <div
                    className="w-full bg-blue-400 rounded-t transition-all hover:bg-blue-500 cursor-pointer"
                    style={{ height: `${Math.max(hydrationHeight, 3)}px` }}
                    title={`${dateLabel}: ${item.totalHydration}ml`}
                  />
                </div>
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  <div>{dateLabel}</div>
                  <div>{item.totalHydration}ml water</div>
                  {bristolScale !== null && <div>Bristol: {bristolScale.toFixed(1)}</div>}
                </div>
                <div className="mt-2 text-xs text-gray-600 text-center">
                  {index % Math.ceil(data.length / 7) === 0 ? dateLabel : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t text-xs">
        <div>
          <div className="font-semibold text-gray-700 mb-2">Hydration Scale</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-400 rounded" />
            <span className="text-gray-600">Daily water intake (ml)</span>
          </div>
        </div>
        <div>
          <div className="font-semibold text-gray-700 mb-2">Bristol Scale</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#8B4513' }} />
              <span className="text-gray-600">Hard (1-2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10B981' }} />
              <span className="text-gray-600">Normal (3-4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
              <span className="text-gray-600">Soft (5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#EF4444' }} />
              <span className="text-gray-600">Liquid (6-7)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

```

## ./src/components/trends/SleepSymptomChart.tsx

```
import { SleepSymptomCorrelation } from '../../hooks/useTrendsData';

interface SleepSymptomChartProps {
  data: SleepSymptomCorrelation[];
}

export default function SleepSymptomChart({ data }: SleepSymptomChartProps) {
  const hasData = data.some(d => d.sleepHours !== null || d.avgSymptomSeverity !== null);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No sleep or symptom data available for this period
      </div>
    );
  }

  const dates = data.filter(d => d.sleepHours !== null || d.avgSymptomSeverity !== null);
  const chartHeight = 240;
  const maxValue = 10;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Sleep Quality vs Symptom Severity</h3>

      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <svg width="100%" height={chartHeight} className="overflow-visible">
          {Array.from({ length: 6 }).map((_, i) => {
            const y = (chartHeight / 5) * i;
            return (
              <g key={i}>
                <line
                  x1="0"
                  y1={y}
                  x2="100%"
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
                <text x="-5" y={y + 4} fontSize="10" fill="#9CA3AF" textAnchor="end">
                  {10 - i * 2}
                </text>
              </g>
            );
          })}

          {dates.length > 1 && (
            <>
              <polyline
                points={dates
                  .map((item, index) => {
                    if (item.sleepHours === null) return null;
                    const x = (index / (dates.length - 1)) * 100;
                    const y = chartHeight - (Math.min(item.sleepHours, 10) / maxValue) * chartHeight;
                    return `${x}%,${y}`;
                  })
                  .filter(Boolean)
                  .join(' ')}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <polyline
                points={dates
                  .map((item, index) => {
                    if (item.avgSymptomSeverity === null) return null;
                    const x = (index / (dates.length - 1)) * 100;
                    const y = chartHeight - (item.avgSymptomSeverity / maxValue) * chartHeight;
                    return `${x}%,${y}`;
                  })
                  .filter(Boolean)
                  .join(' ')}
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 4"
              />
            </>
          )}

          {dates.map((item, index) => {
            const x = (index / Math.max(dates.length - 1, 1)) * 100;
            const date = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return (
              <g key={index}>
                {item.sleepHours !== null && (
                  <circle
                    cx={`${x}%`}
                    cy={chartHeight - (Math.min(item.sleepHours, 10) / maxValue) * chartHeight}
                    r="4"
                    fill="#3B82F6"
                    className="hover:r-6 transition-all cursor-pointer"
                  >
                    <title>{`${date}: ${item.sleepHours.toFixed(1)} hours sleep (Quality: ${item.sleepQuality || 'N/A'})`}</title>
                  </circle>
                )}
                {item.avgSymptomSeverity !== null && (
                  <circle
                    cx={`${x}%`}
                    cy={chartHeight - (item.avgSymptomSeverity / maxValue) * chartHeight}
                    r="4"
                    fill="#EF4444"
                    className="hover:r-6 transition-all cursor-pointer"
                  >
                    <title>{`${date}: Avg symptom severity ${item.avgSymptomSeverity.toFixed(1)}/10`}</title>
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex gap-6 pt-2 border-t text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-blue-600 rounded" />
          <span className="text-gray-700">Sleep Hours</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-red-500 rounded border-t-2 border-dashed border-red-500" />
          <span className="text-gray-700">Symptom Severity</span>
        </div>
      </div>

      <div className="p-3 bg-amber-50 rounded-lg">
        <p className="text-xs text-amber-800">
          <strong>Note:</strong> Better sleep quality (higher hours) typically correlates with lower symptom severity
        </p>
      </div>
    </div>
  );
}

```

## ./src/components/trends/StressUrgencyChart.tsx

```
import { StressUrgencyCorrelation } from '../../hooks/useTrendsData';

interface StressUrgencyChartProps {
  data: StressUrgencyCorrelation[];
}

export default function StressUrgencyChart({ data }: StressUrgencyChartProps) {
  const hasData = data.some(d => d.avgStressLevel !== null || d.avgUrgency !== null);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No stress or urgency data available for this period
      </div>
    );
  }

  const maxValue = 10;
  const chartHeight = 240;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Stress Level vs Bowel Urgency</h3>

      <div className="relative" style={{ height: `${chartHeight + 40}px` }}>
        <svg width="100%" height={chartHeight} className="overflow-visible">
          {Array.from({ length: 6 }).map((_, i) => {
            const y = (chartHeight / 5) * i;
            return (
              <g key={i}>
                <line
                  x1="0"
                  y1={y}
                  x2="100%"
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
                <text x="-5" y={y + 4} fontSize="10" fill="#9CA3AF" textAnchor="end">
                  {10 - i * 2}
                </text>
              </g>
            );
          })}

          {data.map((item, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * 100;
            const date = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return (
              <g key={index}>
                {item.avgStressLevel !== null && (
                  <>
                    <line
                      x1={`${x}%`}
                      y1={chartHeight}
                      x2={`${x}%`}
                      y2={chartHeight - (item.avgStressLevel / maxValue) * chartHeight}
                      stroke="#8B5CF6"
                      strokeWidth="8"
                      opacity="0.6"
                      className="hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <title>{`${date}: Stress ${item.avgStressLevel.toFixed(1)}/10`}</title>
                    </line>
                  </>
                )}
                {item.avgUrgency !== null && (
                  <circle
                    cx={`${x}%`}
                    cy={chartHeight - (item.avgUrgency / maxValue) * chartHeight}
                    r="5"
                    fill="#F59E0B"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="hover:r-7 transition-all cursor-pointer"
                  >
                    <title>{`${date}: Urgency ${item.avgUrgency.toFixed(1)}/10 (${item.urgencyEpisodes} high urgency episodes)`}</title>
                  </circle>
                )}

                {item.urgencyEpisodes > 0 && (
                  <text
                    x={`${x}%`}
                    y={chartHeight + 15}
                    fontSize="10"
                    fill="#DC2626"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {item.urgencyEpisodes}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-500">
          Red numbers indicate high urgency episodes (≥7/10)
        </div>
      </div>

      <div className="flex gap-6 pt-2 border-t text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded opacity-60" />
          <span className="text-gray-700">Stress Level (bars)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded-full border-2 border-white" />
          <span className="text-gray-700">Urgency Level (dots)</span>
        </div>
      </div>

      <div className="p-3 bg-purple-50 rounded-lg">
        <p className="text-xs text-purple-800">
          <strong>Insight:</strong> Higher stress levels often correlate with increased bowel urgency and frequency
        </p>
      </div>
    </div>
  );
}

```

## ./src/components/trends/SymptomIntensityChart.tsx

```
import { SymptomTrend } from '../../hooks/useTrendsData';

interface SymptomIntensityChartProps {
  data: SymptomTrend[];
}

const symptomColors: Record<string, string> = {
  bloating: '#3B82F6',
  cramping: '#EF4444',
  nausea: '#10B981',
  fatigue: '#F59E0B',
  headache: '#8B5CF6',
  diarrhea: '#EC4899',
  constipation: '#6366F1',
  default: '#6B7280',
};

export default function SymptomIntensityChart({ data }: SymptomIntensityChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No symptom data available for this period
      </div>
    );
  }

  const symptomTypes = Array.from(new Set(data.map(d => d.symptomType)));
  const dates = Array.from(new Set(data.map(d => d.date))).sort();

  const symptomDataMap = new Map<string, Map<string, number>>();
  data.forEach(item => {
    if (!symptomDataMap.has(item.symptomType)) {
      symptomDataMap.set(item.symptomType, new Map());
    }
    symptomDataMap.get(item.symptomType)!.set(item.date, item.avgSeverity);
  });

  const maxSeverity = 10;
  const chartHeight = 240;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Symptom Intensity Over Time</h3>

      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <svg width="100%" height={chartHeight} className="overflow-visible">
          <defs>
            {symptomTypes.map(symptom => (
              <linearGradient key={symptom} id={`gradient-${symptom}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={symptomColors[symptom] || symptomColors.default} stopOpacity="0.3" />
                <stop offset="100%" stopColor={symptomColors[symptom] || symptomColors.default} stopOpacity="0.05" />
              </linearGradient>
            ))}
          </defs>

          {Array.from({ length: 6 }).map((_, i) => {
            const y = (chartHeight / 5) * i;
            return (
              <g key={i}>
                <line
                  x1="0"
                  y1={y}
                  x2="100%"
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
                <text x="-5" y={y + 4} fontSize="10" fill="#9CA3AF" textAnchor="end">
                  {10 - i * 2}
                </text>
              </g>
            );
          })}

          {symptomTypes.map((symptom, symptomIndex) => {
            const symptomData = symptomDataMap.get(symptom)!;
            const points = dates.map((date, index) => {
              const severity = symptomData.get(date) || 0;
              const x = (index / (dates.length - 1)) * 100;
              const y = chartHeight - (severity / maxSeverity) * chartHeight;
              return `${x}%,${y}`;
            }).join(' ');

            const areaPoints = dates.map((date, index) => {
              const severity = symptomData.get(date) || 0;
              const x = (index / (dates.length - 1)) * 100;
              const y = chartHeight - (severity / maxSeverity) * chartHeight;
              return [x, y];
            });

            const areaPath = `
              M 0%,${chartHeight}
              ${areaPoints.map(([x, y]) => `L ${x}%,${y}`).join(' ')}
              L 100%,${chartHeight}
              Z
            `;

            return (
              <g key={symptom}>
                <path
                  d={areaPath}
                  fill={`url(#gradient-${symptom})`}
                  opacity="0.5"
                />
                <polyline
                  points={points}
                  fill="none"
                  stroke={symptomColors[symptom] || symptomColors.default}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {dates.map((date, index) => {
                  const severity = symptomData.get(date);
                  if (!severity) return null;
                  const x = (index / (dates.length - 1)) * 100;
                  const y = chartHeight - (severity / maxSeverity) * chartHeight;
                  return (
                    <circle
                      key={`${symptom}-${index}`}
                      cx={`${x}%`}
                      cy={y}
                      r="3"
                      fill={symptomColors[symptom] || symptomColors.default}
                      className="hover:r-5 transition-all cursor-pointer"
                    >
                      <title>{`${symptom} - ${new Date(date).toLocaleDateString()}: ${severity.toFixed(1)}/10`}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap gap-3 pt-2 border-t">
        {symptomTypes.map(symptom => (
          <div key={symptom} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: symptomColors[symptom] || symptomColors.default }}
            />
            <span className="text-sm text-gray-700 capitalize">{symptom}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

```

## ./src/constants/domain.ts

```
export const BRISTOL_SCALE = [
  { value: 1, label: 'Type 1', desc: 'Separate hard lumps' },
  { value: 2, label: 'Type 2', desc: 'Lumpy sausage' },
  { value: 3, label: 'Type 3', desc: 'Cracked sausage' },
  { value: 4, label: 'Type 4', desc: 'Smooth snake' },
  { value: 5, label: 'Type 5', desc: 'Soft blobs' },
  { value: 6, label: 'Type 6', desc: 'Fluffy pieces' },
  { value: 7, label: 'Type 7', desc: 'Watery liquid' },
];

export const COMMON_SYMPTOMS = [
  'Abdominal Pain',
  'Bloating',
  'Nausea',
  'Cramping',
  'Gas',
  'Headache',
  'Fatigue',
  'Dizziness',
];

export const COMMON_TRIGGERS = [
  'Food',
  'Stress',
  'Lack of Sleep',
  'Exercise',
  'Weather',
  'Medication',
  'Dehydration',
];

export const COMMON_SIDE_EFFECTS = [
  'Drowsiness',
  'Nausea',
  'Dizziness',
  'Headache',
  'Dry Mouth',
  'Upset Stomach',
  'Fatigue',
  'None',
];

export const BEVERAGE_TYPES = [
  { label: 'Water', value: 'Water', ml: 250 },
  { label: 'Coffee', value: 'Coffee', ml: 240 },
  { label: 'Tea', value: 'Tea', ml: 240 },
  { label: 'Juice', value: 'Juice', ml: 200 },
  { label: 'Soda', value: 'Soda', ml: 330 },
  { label: 'Sports Drink', value: 'Sports Drink', ml: 500 },
  { label: 'Milk', value: 'Milk', ml: 250 },
  { label: 'Other', value: 'Other', ml: 250 },
];

export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

export const PORTION_SIZES = ['Small', 'Medium', 'Large', 'Extra Large'];

export const QUICK_HYDRATION_AMOUNTS = [250, 350, 500, 750, 1000];

export const MEDICATION_TYPES = [
  { value: 'prescription', label: 'Prescription' },
  { value: 'otc', label: 'Over-the-Counter' },
  { value: 'supplement', label: 'Supplement' },
];

export const STRESS_TRIGGERS = [
  'Work',
  'Relationships',
  'Finances',
  'Health',
  'Family',
  'Deadlines',
  'Social Events',
  'Traffic',
];

export const STRESS_COPING_METHODS = [
  'Deep Breathing',
  'Exercise',
  'Meditation',
  'Talk to Someone',
  'Music',
  'Walk',
  'Journaling',
  'Rest',
];

export const STRESS_PHYSICAL_SYMPTOMS = [
  'Headache',
  'Tension',
  'Rapid Heartbeat',
  'Fatigue',
  'Stomach Issues',
  'Sweating',
  'Muscle Pain',
  'Sleep Issues',
];

```

## ./src/contexts/AuthContext.tsx

```
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
          });

        if (profileError) throw profileError;
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

```

## ./src/hooks/useAutoGenerateInsights.ts

```
import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateAllInsights, saveInsights } from '../utils/insightEngine';

export function useAutoGenerateInsights() {
  const { user } = useAuth();
  const hasGeneratedRef = useRef(false);

  useEffect(() => {
    if (!user || hasGeneratedRef.current) return;

    const generateInsightsInBackground = async () => {
      try {
        const lastGeneratedKey = `insights_last_generated_${user.id}`;
        const lastGenerated = localStorage.getItem(lastGeneratedKey);
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (lastGenerated && now - parseInt(lastGenerated) < twentyFourHours) {
          return;
        }

        const insights = await generateAllInsights(user.id);

        if (insights.length > 0) {
          await saveInsights(insights);
          localStorage.setItem(lastGeneratedKey, now.toString());
        }

        hasGeneratedRef.current = true;
      } catch (error) {
        console.error('Background insight generation failed:', error);
      }
    };

    const timeoutId = setTimeout(() => {
      generateInsightsInBackground();
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [user]);
}

```

## ./src/hooks/useDashboardData.ts

```
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface DashboardMetrics {
  todayBMCount: number;
  averageBristolScale: number | null;
  todaySymptoms: Array<{
    symptom_type: string;
    severity: number;
    logged_at: string;
  }>;
  todayHydration: {
    total_ml: number;
    target_ml: number;
    entries: number;
  };
  recentMedications: Array<{
    id: string;
    medication_name: string;
    dosage: string;
    logged_at: string;
    taken_as_prescribed: boolean;
  }>;
  todayFood: {
    meals: number;
    snacks: number;
  };
  lastSleep: {
    duration_minutes: number | null;
    quality: number | null;
    felt_rested: boolean;
  } | null;
  todayStress: {
    average_level: number | null;
    count: number;
  };
}

export function useDashboardData() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todayBMCount: 0,
    averageBristolScale: null,
    todaySymptoms: [],
    todayHydration: { total_ml: 0, target_ml: 2000, entries: 0 },
    recentMedications: [],
    todayFood: { meals: 0, snacks: 0 },
    lastSleep: null,
    todayStress: { average_level: null, count: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const [
        bmData,
        symptomsData,
        hydrationData,
        medicationData,
        foodData,
        sleepData,
        stressData,
      ] = await Promise.all([
        supabase
          .from('bm_logs')
          .select('bristol_scale')
          .eq('user_id', user.id)
          .gte('logged_at', todayISO),
        supabase
          .from('symptom_logs')
          .select('symptom_type, severity, logged_at')
          .eq('user_id', user.id)
          .gte('logged_at', todayISO)
          .order('logged_at', { ascending: false }),
        supabase
          .from('hydration_logs')
          .select('amount_ml')
          .eq('user_id', user.id)
          .gte('logged_at', todayISO),
        supabase
          .from('medication_logs')
          .select('id, medication_name, dosage, logged_at, taken_as_prescribed')
          .eq('user_id', user.id)
          .gte('logged_at', todayISO)
          .order('logged_at', { ascending: false })
          .limit(5),
        supabase
          .from('food_logs')
          .select('meal_type')
          .eq('user_id', user.id)
          .gte('logged_at', todayISO),
        supabase
          .from('sleep_logs')
          .select('duration_minutes, quality, felt_rested, sleep_start')
          .eq('user_id', user.id)
          .order('sleep_start', { ascending: false })
          .limit(1),
        supabase
          .from('stress_logs')
          .select('stress_level')
          .eq('user_id', user.id)
          .gte('logged_at', todayISO),
      ]);

      const bmCount = bmData.data?.length || 0;
      const avgBristol =
        bmCount > 0
          ? bmData.data!.reduce((sum, log) => sum + log.bristol_scale, 0) / bmCount
          : null;

      const totalHydration = hydrationData.data?.reduce(
        (sum, log) => sum + log.amount_ml,
        0
      ) || 0;

      const foodLogs = foodData.data || [];
      const meals = foodLogs.filter((log) =>
        ['breakfast', 'lunch', 'dinner'].includes(log.meal_type)
      ).length;
      const snacks = foodLogs.filter((log) => log.meal_type === 'snack').length;

      const sleepLog = sleepData.data?.[0] || null;
      const lastSleep = sleepLog
        ? {
            duration_minutes: sleepLog.duration_minutes,
            quality: sleepLog.quality,
            felt_rested: sleepLog.felt_rested,
          }
        : null;

      const stressLogs = stressData.data || [];
      const avgStress =
        stressLogs.length > 0
          ? stressLogs.reduce((sum, log) => sum + log.stress_level, 0) / stressLogs.length
          : null;

      setMetrics({
        todayBMCount: bmCount,
        averageBristolScale: avgBristol,
        todaySymptoms: symptomsData.data || [],
        todayHydration: {
          total_ml: totalHydration,
          target_ml: 2000,
          entries: hydrationData.data?.length || 0,
        },
        recentMedications: medicationData.data || [],
        todayFood: { meals, snacks },
        lastSleep,
        todayStress: { average_level: avgStress, count: stressLogs.length },
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading, error, refresh: fetchDashboardData };
}

```

## ./src/hooks/useMealStatistics.ts

```
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface MealStatistics {
  todayMealCount: number;
  totalCalories: number;
}

export function useMealStatistics() {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<MealStatistics>({
    todayMealCount: 0,
    totalCalories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchMealStatistics();
    const interval = setInterval(fetchMealStatistics, 60000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchMealStatistics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { data, error: queryError } = await supabase
        .from('food_logs')
        .select('meal_type, calories')
        .eq('user_id', user.id)
        .gte('logged_at', todayISO);

      if (queryError) throw queryError;

      const meals = data || [];
      const mealCount = meals.filter((log) =>
        ['breakfast', 'lunch', 'dinner'].includes(log.meal_type)
      ).length;
      const totalCalories = meals.reduce((sum, log) => sum + (log.calories || 0), 0);

      setStatistics({
        todayMealCount: mealCount,
        totalCalories,
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching meal statistics:', err);
      setError('Failed to load meal statistics');
    } finally {
      setLoading(false);
    }
  };

  return { statistics, loading, error, refresh: fetchMealStatistics };
}

```

## ./src/hooks/useTrendsData.ts

```
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface TimeRange {
  days: 7 | 14 | 30;
  label: string;
}

interface BMFrequencyData {
  date: string;
  count: number;
}

interface BristolDistribution {
  type: number;
  count: number;
  percentage: number;
}

interface SymptomTrend {
  date: string;
  symptomType: string;
  avgSeverity: number;
}

interface HydrationCorrelation {
  date: string;
  totalHydration: number;
  avgBristolScale: number | null;
}

interface SleepSymptomCorrelation {
  date: string;
  sleepHours: number | null;
  sleepQuality: number | null;
  avgSymptomSeverity: number | null;
}

interface StressUrgencyCorrelation {
  date: string;
  avgStressLevel: number | null;
  avgUrgency: number | null;
  urgencyEpisodes: number;
}

export interface TrendsData {
  bmFrequency: BMFrequencyData[];
  bristolDistribution: BristolDistribution[];
  symptomTrends: SymptomTrend[];
  hydrationCorrelation: HydrationCorrelation[];
  sleepSymptomCorrelation: SleepSymptomCorrelation[];
  stressUrgencyCorrelation: StressUrgencyCorrelation[];
}

export function useTrendsData(timeRange: TimeRange) {
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrendsData() {
      setLoading(true);
      setError(null);

      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange.days);
        const startDateStr = startDate.toISOString();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        const [bmLogs, symptomLogs, hydrationLogs, sleepLogs, stressLogs] = await Promise.all([
          supabase
            .from('bm_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('logged_at', startDateStr)
            .order('logged_at', { ascending: true }),
          supabase
            .from('symptom_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('logged_at', startDateStr)
            .order('logged_at', { ascending: true }),
          supabase
            .from('hydration_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('logged_at', startDateStr)
            .order('logged_at', { ascending: true }),
          supabase
            .from('sleep_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('sleep_start', startDateStr)
            .order('sleep_start', { ascending: true }),
          supabase
            .from('stress_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('logged_at', startDateStr)
            .order('logged_at', { ascending: true }),
        ]);

        if (bmLogs.error) throw bmLogs.error;
        if (symptomLogs.error) throw symptomLogs.error;
        if (hydrationLogs.error) throw hydrationLogs.error;
        if (sleepLogs.error) throw sleepLogs.error;
        if (stressLogs.error) throw stressLogs.error;

        const bmFrequency = calculateBMFrequency(bmLogs.data || [], timeRange.days);
        const bristolDistribution = calculateBristolDistribution(bmLogs.data || []);
        const symptomTrends = calculateSymptomTrends(symptomLogs.data || [], timeRange.days);
        const hydrationCorrelation = calculateHydrationCorrelation(
          hydrationLogs.data || [],
          bmLogs.data || [],
          timeRange.days
        );
        const sleepSymptomCorrelation = calculateSleepSymptomCorrelation(
          sleepLogs.data || [],
          symptomLogs.data || [],
          timeRange.days
        );
        const stressUrgencyCorrelation = calculateStressUrgencyCorrelation(
          stressLogs.data || [],
          bmLogs.data || [],
          timeRange.days
        );

        setData({
          bmFrequency,
          bristolDistribution,
          symptomTrends,
          hydrationCorrelation,
          sleepSymptomCorrelation,
          stressUrgencyCorrelation,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trends data');
      } finally {
        setLoading(false);
      }
    }

    fetchTrendsData();
  }, [timeRange]);

  return { data, loading, error };
}

function calculateBMFrequency(logs: any[], days: number): BMFrequencyData[] {
  const dateMap = new Map<string, number>();

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dateMap.set(date.toISOString().split('T')[0], 0);
  }

  logs.forEach(log => {
    const date = new Date(log.logged_at).toISOString().split('T')[0];
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });

  return Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateBristolDistribution(logs: any[]): BristolDistribution[] {
  const bristolCount = new Map<number, number>();

  logs.forEach(log => {
    const type = log.bristol_scale || log.bristol_type;
    if (type) {
      bristolCount.set(type, (bristolCount.get(type) || 0) + 1);
    }
  });

  const total = logs.length;
  const distribution: BristolDistribution[] = [];

  for (let i = 1; i <= 7; i++) {
    const count = bristolCount.get(i) || 0;
    distribution.push({
      type: i,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    });
  }

  return distribution;
}

function calculateSymptomTrends(logs: any[], days: number): SymptomTrend[] {
  const symptomDateMap = new Map<string, Map<string, number[]>>();

  logs.forEach(log => {
    const date = new Date(log.logged_at).toISOString().split('T')[0];
    if (!symptomDateMap.has(date)) {
      symptomDateMap.set(date, new Map());
    }
    const dateSymptoms = symptomDateMap.get(date)!;
    if (!dateSymptoms.has(log.symptom_type)) {
      dateSymptoms.set(log.symptom_type, []);
    }
    dateSymptoms.get(log.symptom_type)!.push(log.severity);
  });

  const trends: SymptomTrend[] = [];
  symptomDateMap.forEach((symptoms, date) => {
    symptoms.forEach((severities, symptomType) => {
      const avgSeverity = severities.reduce((a, b) => a + b, 0) / severities.length;
      trends.push({ date, symptomType, avgSeverity });
    });
  });

  return trends.sort((a, b) => a.date.localeCompare(b.date));
}

function calculateHydrationCorrelation(
  hydrationLogs: any[],
  bmLogs: any[],
  days: number
): HydrationCorrelation[] {
  const dateMap = new Map<string, { hydration: number; bristolScales: number[] }>();

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dateMap.set(date.toISOString().split('T')[0], { hydration: 0, bristolScales: [] });
  }

  hydrationLogs.forEach(log => {
    const date = new Date(log.logged_at).toISOString().split('T')[0];
    const existing = dateMap.get(date);
    if (existing) {
      existing.hydration += log.amount_ml;
    }
  });

  bmLogs.forEach(log => {
    const date = new Date(log.logged_at).toISOString().split('T')[0];
    const existing = dateMap.get(date);
    const bristolScale = log.bristol_scale || log.bristol_type;
    if (existing && bristolScale) {
      existing.bristolScales.push(bristolScale);
    }
  });

  return Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      totalHydration: data.hydration,
      avgBristolScale: data.bristolScales.length > 0
        ? data.bristolScales.reduce((a, b) => a + b, 0) / data.bristolScales.length
        : null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateSleepSymptomCorrelation(
  sleepLogs: any[],
  symptomLogs: any[],
  days: number
): SleepSymptomCorrelation[] {
  const dateMap = new Map<string, { sleepHours: number | null; sleepQuality: number | null; symptoms: number[] }>();

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dateMap.set(date.toISOString().split('T')[0], { sleepHours: null, sleepQuality: null, symptoms: [] });
  }

  sleepLogs.forEach(log => {
    const date = new Date(log.sleep_start).toISOString().split('T')[0];
    const existing = dateMap.get(date);
    if (existing) {
      existing.sleepHours = log.duration_minutes ? log.duration_minutes / 60 : null;
      existing.sleepQuality = log.quality;
    }
  });

  symptomLogs.forEach(log => {
    const date = new Date(log.logged_at).toISOString().split('T')[0];
    const existing = dateMap.get(date);
    if (existing) {
      existing.symptoms.push(log.severity);
    }
  });

  return Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      sleepHours: data.sleepHours,
      sleepQuality: data.sleepQuality,
      avgSymptomSeverity: data.symptoms.length > 0
        ? data.symptoms.reduce((a, b) => a + b, 0) / data.symptoms.length
        : null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateStressUrgencyCorrelation(
  stressLogs: any[],
  bmLogs: any[],
  days: number
): StressUrgencyCorrelation[] {
  const dateMap = new Map<string, { stressLevels: number[]; urgencyLevels: number[]; urgencyCount: number }>();

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dateMap.set(date.toISOString().split('T')[0], { stressLevels: [], urgencyLevels: [], urgencyCount: 0 });
  }

  stressLogs.forEach(log => {
    const date = new Date(log.logged_at).toISOString().split('T')[0];
    const existing = dateMap.get(date);
    if (existing) {
      existing.stressLevels.push(log.stress_level);
    }
  });

  bmLogs.forEach(log => {
    const date = new Date(log.logged_at).toISOString().split('T')[0];
    const existing = dateMap.get(date);
    const urgency = log.urgency_level || log.urgency;
    if (existing && urgency) {
      existing.urgencyLevels.push(urgency);
      if (urgency >= 7) {
        existing.urgencyCount++;
      }
    }
  });

  return Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      avgStressLevel: data.stressLevels.length > 0
        ? data.stressLevels.reduce((a, b) => a + b, 0) / data.stressLevels.length
        : null,
      avgUrgency: data.urgencyLevels.length > 0
        ? data.urgencyLevels.reduce((a, b) => a + b, 0) / data.urgencyLevels.length
        : null,
      urgencyEpisodes: data.urgencyCount,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

```

## ./src/index.css

```
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-sans antialiased;
    font-family: 'Inter', sans-serif;
  }

  html {
    scroll-behavior: smooth;
  }

  * {
    @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold;
    line-height: 1.2;
  }

  p {
    line-height: 1.5;
  }

  a {
    @apply transition-colors duration-150;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

```

## ./src/lib/supabase.ts

```
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    timeout: 120000,
  },
});

```

## ./src/main.tsx

```
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './animations.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

```

## ./src/pages/Account.tsx

```
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, LogOut, Save } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Account() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    heightCm: '',
    weightKg: '',
    timezone: 'UTC',
  });

  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobYear, setDobYear] = useState('');

  const [heightUnit, setHeightUnit] = useState<'imperial' | 'metric'>('imperial');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [heightCm, setHeightCm] = useState('');

  const [weightUnit, setWeightUnit] = useState<'imperial' | 'metric'>('imperial');
  const [weightLbs, setWeightLbs] = useState('');
  const [weightKg, setWeightKg] = useState('');

  const months = useMemo(() => [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ], []);

  const days = useMemo(() => {
    const daysInMonth = dobMonth && dobYear
      ? new Date(parseInt(dobYear), parseInt(dobMonth), 0).getDate()
      : 31;
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = (i + 1).toString().padStart(2, '0');
      return { value: day, label: day };
    });
  }, [dobMonth, dobYear]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 100;
    return Array.from({ length: 101 }, (_, i) => {
      const year = (currentYear - i).toString();
      return { value: year, label: year };
    });
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setFormData({
            fullName: profile.full_name || '',
            email: profile.email || user.email || '',
            dateOfBirth: profile.date_of_birth || '',
            gender: profile.gender || '',
            heightCm: profile.height_cm || '',
            weightKg: profile.weight_kg || '',
            timezone: profile.timezone || 'UTC',
          });

          if (profile.date_of_birth) {
            const [year, month, day] = profile.date_of_birth.split('-');
            setDobYear(year);
            setDobMonth(month);
            setDobDay(day);
          }

          if (profile.height_cm) {
            const cm = profile.height_cm.toString();
            setHeightCm(cm);
            const totalInches = parseFloat(cm) / 2.54;
            const feet = Math.floor(totalInches / 12);
            const inches = Math.round(totalInches % 12);
            setHeightFeet(feet.toString());
            setHeightInches(inches.toString());
          }

          if (profile.weight_kg) {
            const kg = profile.weight_kg.toString();
            setWeightKg(kg);
            const lbs = (parseFloat(kg) * 2.20462).toFixed(1);
            setWeightLbs(lbs);
          }
        } else {
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
          }));
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (dobMonth && dobDay && dobYear) {
      const dateString = `${dobYear}-${dobMonth}-${dobDay}`;
      setFormData(prev => ({ ...prev, dateOfBirth: dateString }));
    } else {
      setFormData(prev => ({ ...prev, dateOfBirth: '' }));
    }
  }, [dobMonth, dobDay, dobYear]);

  useEffect(() => {
    if (heightUnit === 'imperial' && heightFeet && heightInches) {
      const totalInches = parseInt(heightFeet) * 12 + parseInt(heightInches);
      const cm = (totalInches * 2.54).toFixed(1);
      setHeightCm(cm);
      setFormData(prev => ({ ...prev, heightCm: cm }));
    } else if (heightUnit === 'metric' && heightCm) {
      setFormData(prev => ({ ...prev, heightCm }));
    }
  }, [heightFeet, heightInches, heightCm, heightUnit]);

  useEffect(() => {
    if (weightUnit === 'imperial' && weightLbs) {
      const kg = (parseFloat(weightLbs) / 2.20462).toFixed(1);
      setWeightKg(kg);
      setFormData(prev => ({ ...prev, weightKg: kg }));
    } else if (weightUnit === 'metric' && weightKg) {
      setFormData(prev => ({ ...prev, weightKg }));
    }
  }, [weightLbs, weightKg, weightUnit]);

  const handleHeightUnitToggle = () => {
    if (heightUnit === 'imperial') {
      setHeightUnit('metric');
    } else {
      setHeightUnit('imperial');
      if (heightCm) {
        const totalInches = parseFloat(heightCm) / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        setHeightFeet(feet.toString());
        setHeightInches(inches.toString());
      }
    }
  };

  const handleWeightUnitToggle = () => {
    if (weightUnit === 'imperial') {
      setWeightUnit('metric');
    } else {
      setWeightUnit('imperial');
      if (weightKg) {
        const lbs = (parseFloat(weightKg) * 2.20462).toFixed(1);
        setWeightLbs(lbs);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          date_of_birth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          height_cm: formData.heightCm ? parseFloat(formData.heightCm) : null,
          weight_kg: formData.weightKg ? parseFloat(formData.weightKg) : null,
          timezone: formData.timezone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      setMessage('Profile updated successfully');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600 mt-2">Manage your profile and account preferences</p>
            </div>

            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-2xl font-semibold">
                    {formData.fullName.charAt(0).toUpperCase() || formData.email.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                    <p className="text-sm text-gray-600">Update your personal details</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="inline h-4 w-4 mr-1" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Date of Birth
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <select
                          value={dobMonth}
                          onChange={(e) => setDobMonth(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          <option value="">Month</option>
                          {months.map((month) => (
                            <option key={month.value} value={month.value}>
                              {month.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={dobDay}
                          onChange={(e) => setDobDay(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          <option value="">Day</option>
                          {days.map((day) => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={dobYear}
                          onChange={(e) => setDobYear(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          <option value="">Year</option>
                          {years.map((year) => (
                            <option key={year.value} value={year.value}>
                              {year.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Height
                        </label>
                        <button
                          type="button"
                          onClick={handleHeightUnitToggle}
                          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          {heightUnit === 'imperial' ? 'ft/in' : 'cm'}
                        </button>
                      </div>
                      {heightUnit === 'imperial' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={heightFeet}
                            onChange={(e) => setHeightFeet(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="5 ft"
                            min="0"
                            max="8"
                          />
                          <input
                            type="number"
                            value={heightInches}
                            onChange={(e) => setHeightInches(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="10 in"
                            min="0"
                            max="11"
                          />
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={heightCm}
                          onChange={(e) => setHeightCm(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="170 cm"
                          min="0"
                          max="300"
                          step="0.1"
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Weight
                        </label>
                        <button
                          type="button"
                          onClick={handleWeightUnitToggle}
                          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          {weightUnit === 'imperial' ? 'lbs' : 'kg'}
                        </button>
                      </div>
                      {weightUnit === 'imperial' ? (
                        <input
                          type="number"
                          value={weightLbs}
                          onChange={(e) => setWeightLbs(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="155 lbs"
                          min="0"
                          max="1000"
                          step="0.1"
                        />
                      ) : (
                        <input
                          type="number"
                          value={weightKg}
                          onChange={(e) => setWeightKg(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="70 kg"
                          min="0"
                          max="500"
                          step="0.1"
                        />
                      )}
                    </div>

                    <div>
                      <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        id="timezone"
                        value={formData.timezone}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                        <option value="Australia/Sydney">Sydney</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      <Save className="inline h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Card>

              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Actions</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Sign Out</h3>
                      <p className="text-sm text-gray-600">Sign out of your account on this device</p>
                    </div>
                    <Button variant="secondary" onClick={handleSignOut}>
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

```

## ./src/pages/BMLog.tsx

```
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Clock, AlertCircle, Activity } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatDateTime, toLocalDateTimeString, getLocalDateTimeString } from '../utils/dateFormatters';
import SuccessToast from '../components/SuccessToast';
import EmptyState from '../components/EmptyState';
import { getSuccessMessage, getUpdateMessage, getDeleteMessage } from '../utils/copySystem';
import { BRISTOL_SCALE } from '../constants/domain';

interface BMLog {
  id?: string;
  logged_at: string;
  bristol_scale: number;
  urgency_level: number;
  pain_level: number;
  difficulty_level: number;
  incomplete_evacuation: boolean;
  blood_present: boolean;
  mucus_present: boolean;
  amount: 'small' | 'medium' | 'large';
  notes: string;
}

export default function BMLog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [error, setError] = useState('');
  const dismissToast = useCallback(() => setToastVisible(false), []);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<BMLog[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<BMLog>({
    logged_at: getLocalDateTimeString(),
    bristol_scale: 4,
    urgency_level: 5,
    pain_level: 1,
    difficulty_level: 1,
    incomplete_evacuation: false,
    blood_present: false,
    mucus_present: false,
    amount: 'medium',
    notes: '',
  });

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('bm_logs')
      .select('*')
      .eq('user_id', user?.id)
      .order('logged_at', { ascending: false })
      .limit(50);

    if (data) {
      setHistory(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const loggedAtTimestamp = new Date(formData.logged_at).toISOString();

      if (editingId) {
        const { error } = await supabase
          .from('bm_logs')
          .update({
            logged_at: loggedAtTimestamp,
            bristol_scale: formData.bristol_scale,
            urgency_level: formData.urgency_level,
            pain_level: formData.pain_level,
            difficulty_level: formData.difficulty_level,
            incomplete_evacuation: formData.incomplete_evacuation,
            blood_present: formData.blood_present,
            mucus_present: formData.mucus_present,
            amount: formData.amount,
            notes: formData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        setMessage(getUpdateMessage()); setToastVisible(true);
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('bm_logs')
          .insert({
            user_id: user?.id,
            logged_at: loggedAtTimestamp,
            bristol_scale: formData.bristol_scale,
            urgency_level: formData.urgency_level,
            pain_level: formData.pain_level,
            difficulty_level: formData.difficulty_level,
            incomplete_evacuation: formData.incomplete_evacuation,
            blood_present: formData.blood_present,
            mucus_present: formData.mucus_present,
            amount: formData.amount,
            notes: formData.notes,
          });

        if (error) throw error;
        setMessage(getSuccessMessage('bm')); setToastVisible(true);
      }

      resetForm();
      if (showHistory) {
        fetchHistory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      logged_at: getLocalDateTimeString(),
      bristol_scale: 4,
      urgency_level: 5,
      pain_level: 1,
      difficulty_level: 1,
      incomplete_evacuation: false,
      blood_present: false,
      mucus_present: false,
      amount: 'medium',
      notes: '',
    });
    setEditingId(null);
  };

  const handleEdit = (log: any) => {
    setFormData({
      logged_at: toLocalDateTimeString(log.logged_at),
      bristol_scale: log.bristol_scale,
      urgency_level: log.urgency_level,
      pain_level: log.pain_level,
      difficulty_level: log.difficulty_level,
      incomplete_evacuation: log.incomplete_evacuation,
      blood_present: log.blood_present,
      mucus_present: log.mucus_present,
      amount: log.amount,
      notes: log.notes || '',
    });
    setEditingId(log.id);
    setShowHistory(false);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const { error } = await supabase
      .from('bm_logs')
      .delete()
      .eq('id', id);

    if (error) {
      setError('Failed to delete entry');
    } else {
      setMessage(getDeleteMessage()); setToastVisible(true);
      fetchHistory();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Bowel Movement Log</h1>
              <p className="text-gray-600 mt-2">Quick and comprehensive tracking</p>
            </div>

            <SuccessToast message={message} visible={toastVisible} onDismiss={dismissToast} />

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="mb-4 flex gap-3">
              <Button
                variant={!showHistory ? 'primary' : 'secondary'}
                onClick={() => setShowHistory(false)}
              >
                <Activity className="h-4 w-4 mr-2" />
                New Entry
              </Button>
              <Button
                variant={showHistory ? 'primary' : 'secondary'}
                onClick={() => setShowHistory(true)}
              >
                <Clock className="h-4 w-4 mr-2" />
                History
              </Button>
            </div>

            {!showHistory ? (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {editingId ? 'Edit Entry' : 'Log New Entry'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="logged_at" className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Time
                    </label>
                    <input
                      type="datetime-local"
                      id="logged_at"
                      value={formData.logged_at}
                      onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Bristol Stool Scale
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {BRISTOL_SCALE.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, bristol_scale: item.value })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.bristol_scale === item.value
                              ? 'border-teal-500 bg-teal-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                          <div className="text-xs text-gray-600 mt-1">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency Level: {formData.urgency_level.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.1"
                        value={formData.urgency_level}
                        onChange={(e) => setFormData({ ...formData, urgency_level: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                        style={{
                          background: `linear-gradient(to right, rgb(20, 184, 166) 0%, rgb(20, 184, 166) ${((formData.urgency_level - 1) / 9) * 100}%, rgb(229, 231, 235) ${((formData.urgency_level - 1) / 9) * 100}%, rgb(229, 231, 235) 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pain Level: {formData.pain_level.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.1"
                        value={formData.pain_level}
                        onChange={(e) => setFormData({ ...formData, pain_level: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                        style={{
                          background: `linear-gradient(to right, rgb(239, 68, 68) 0%, rgb(239, 68, 68) ${((formData.pain_level - 1) / 9) * 100}%, rgb(229, 231, 235) ${((formData.pain_level - 1) / 9) * 100}%, rgb(229, 231, 235) 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>None</span>
                        <span>Severe</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level: {formData.difficulty_level.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.1"
                        value={formData.difficulty_level}
                        onChange={(e) => setFormData({ ...formData, difficulty_level: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        style={{
                          background: `linear-gradient(to right, rgb(249, 115, 22) 0%, rgb(249, 115, 22) ${((formData.difficulty_level - 1) / 9) * 100}%, rgb(229, 231, 235) ${((formData.difficulty_level - 1) / 9) * 100}%, rgb(229, 231, 235) 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Easy</span>
                        <span>Hard</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Amount</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['small', 'medium', 'large'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFormData({ ...formData, amount: size as 'small' | 'medium' | 'large' })}
                          className={`p-4 rounded-lg border-2 transition-all capitalize ${
                            formData.amount === size
                              ? 'border-teal-500 bg-teal-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Incomplete Evacuation</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, incomplete_evacuation: !formData.incomplete_evacuation })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.incomplete_evacuation ? 'bg-teal-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.incomplete_evacuation ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Blood Present</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, blood_present: !formData.blood_present })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.blood_present ? 'bg-red-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.blood_present ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Mucus Present</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, mucus_present: !formData.mucus_present })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.mucus_present ? 'bg-yellow-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.mucus_present ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows={3}
                      placeholder="Any additional observations..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={saving}>
                      <Save className="inline h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="secondary" onClick={resetForm}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            ) : (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Entry History</h2>
                {history.length === 0 ? (
                  <EmptyState category="bm" icon={<Activity className="h-8 w-8 text-gray-400" />} />
                ) : (
                  <div className="space-y-4">
                    {history.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDateTime(log.logged_at)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Bristol Type {log.bristol_scale} • {log.amount}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(log)}
                              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(log.id!)}
                              className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500">Urgency:</span>
                            <span className="ml-1 font-medium">{Number(log.urgency_level).toFixed(1)}/10</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Pain:</span>
                            <span className="ml-1 font-medium">{Number(log.pain_level).toFixed(1)}/10</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Difficulty:</span>
                            <span className="ml-1 font-medium">{Number(log.difficulty_level).toFixed(1)}/10</span>
                          </div>
                        </div>
                        {(log.incomplete_evacuation || log.blood_present || log.mucus_present) && (
                          <div className="mt-3 flex gap-2">
                            {log.incomplete_evacuation && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Incomplete
                              </span>
                            )}
                            {log.blood_present && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Blood
                              </span>
                            )}
                            {log.mucus_present && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Mucus
                              </span>
                            )}
                          </div>
                        )}
                        {log.notes && (
                          <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {log.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

```

## ./src/pages/Community.tsx

```
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import { Users, MessageSquare, Heart, TrendingUp } from 'lucide-react';

export default function Community() {
  const posts = [
    {
      author: 'Sarah M.',
      avatar: 'SM',
      time: '2 hours ago',
      title: 'My Journey to Better Gut Health',
      excerpt: 'After 3 months of following the recommendations, I\'ve seen amazing improvements...',
      likes: 24,
      comments: 12,
    },
    {
      author: 'John D.',
      avatar: 'JD',
      time: '5 hours ago',
      title: 'Tips for Managing IBS Symptoms',
      excerpt: 'Here are some strategies that have really helped me manage my symptoms...',
      likes: 18,
      comments: 8,
    },
    {
      author: 'Emily R.',
      avatar: 'ER',
      time: '1 day ago',
      title: 'Question About Probiotic Foods',
      excerpt: 'Can anyone recommend good probiotic-rich foods to add to my diet?',
      likes: 15,
      comments: 23,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Community</h1>
              <p className="text-gray-600">Connect with others on their gut health journey</p>
            </div>
            <Button className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              New Post
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card className="text-center">
              <Users className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">12.5K</p>
              <p className="text-sm text-gray-600">Members</p>
            </Card>
            <Card className="text-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">3.2K</p>
              <p className="text-sm text-gray-600">Discussions</p>
            </Card>
            <Card className="text-center">
              <Heart className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">45K</p>
              <p className="text-sm text-gray-600">Helpful Votes</p>
            </Card>
            <Card className="text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">89%</p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {posts.map((post) => (
                <Card key={post.title}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {post.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{post.author}</span>
                        <span className="text-sm text-gray-500">{post.time}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-4">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <button className="flex items-center gap-1 hover:text-pink-600 transition-colors">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          {post.comments}
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Community Guidelines</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Be respectful and supportive</li>
                  <li>Share experiences, not medical advice</li>
                  <li>Protect privacy and confidentiality</li>
                  <li>Report inappropriate content</li>
                </ul>
              </Card>

              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Popular Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {['IBS', 'Diet Tips', 'Probiotics', 'Success Stories', 'Recipes'].map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

```

## ./src/pages/Dashboard.tsx

```
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import {
  Activity,
  Utensils,
  Droplet,
  Moon,
  Brain,
  Pill,
  AlertCircle
} from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useAutoGenerateInsights } from '../hooks/useAutoGenerateInsights';
import TodaySummaryWidget from '../components/dashboard/TodaySummaryWidget';
import BMCountWidget from '../components/dashboard/BMCountWidget';
import BristolScaleWidget from '../components/dashboard/BristolScaleWidget';
import SymptomSnapshotWidget from '../components/dashboard/SymptomSnapshotWidget';
import HydrationWidget from '../components/dashboard/HydrationWidget';
import MedicationWidget from '../components/dashboard/MedicationWidget';
import PatternInsightsWidget from '../components/dashboard/PatternInsightsWidget';
import WelcomeBanner from '../components/WelcomeBanner';
import StreakTracker from '../components/StreakTracker';
import EncouragementPrompt from '../components/EncouragementPrompt';

export default function Dashboard() {
  const navigate = useNavigate();
  const { metrics, loading, error } = useDashboardData();
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>('');

  useAutoGenerateInsights();

  const sleepHours = metrics.lastSleep?.duration_minutes
    ? Math.round(metrics.lastSleep.duration_minutes / 60)
    : null;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (data && !error) {
        setUserName(data.full_name || '');
      }
    };

    fetchUserProfile();
  }, [user]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          <WelcomeBanner userName={userName} />
          <EncouragementPrompt onNavigate={navigate} />

          <div className="mb-6">
            <TodaySummaryWidget
              bmCount={metrics.todayBMCount}
              mealsCount={metrics.todayFood.meals}
              snacksCount={metrics.todayFood.snacks}
              hydrationMl={metrics.todayHydration.total_ml}
              sleepHours={sleepHours}
              loading={loading}
              userName={userName}
            />
          </div>

          <div className="mb-6">
            <StreakTracker />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <BMCountWidget count={metrics.todayBMCount} loading={loading} />

            <BristolScaleWidget
              averageScale={metrics.averageBristolScale}
              count={metrics.todayBMCount}
              loading={loading}
            />

            <SymptomSnapshotWidget
              symptoms={metrics.todaySymptoms}
              loading={loading}
            />

            <HydrationWidget
              totalMl={metrics.todayHydration.total_ml}
              targetMl={metrics.todayHydration.target_ml}
              entries={metrics.todayHydration.entries}
              loading={loading}
            />

            <MedicationWidget
              medications={metrics.recentMedications}
              loading={loading}
            />

            <PatternInsightsWidget
              bmCount={metrics.todayBMCount}
              symptomsCount={metrics.todaySymptoms.length}
              stressLevel={metrics.todayStress.average_level}
              hydrationPercentage={(metrics.todayHydration.total_ml / metrics.todayHydration.target_ml) * 100}
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Log Actions</h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate('/bm-log')}
                  className="px-3 py-3 text-left bg-teal-50 hover:bg-teal-100 rounded-lg transition-all hover:shadow-sm group"
                >
                  <Activity className="h-5 w-5 text-teal-600 mb-1 transition-transform group-hover:scale-110" />
                  <p className="text-sm font-medium text-teal-900">Bowel Movement</p>
                </button>
                <button
                  onClick={() => navigate('/food-log')}
                  className="px-3 py-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-all hover:shadow-sm group"
                >
                  <Utensils className="h-5 w-5 text-orange-600 mb-1 transition-transform group-hover:scale-110" />
                  <p className="text-sm font-medium text-orange-900">Food Intake</p>
                </button>
                <button
                  onClick={() => navigate('/symptoms-log')}
                  className="px-3 py-3 text-left bg-red-50 hover:bg-red-100 rounded-lg transition-all hover:shadow-sm group"
                >
                  <AlertCircle className="h-5 w-5 text-red-600 mb-1 transition-transform group-hover:scale-110" />
                  <p className="text-sm font-medium text-red-900">Symptoms</p>
                </button>
                <button
                  onClick={() => navigate('/sleep-log')}
                  className="px-3 py-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-all hover:shadow-sm group"
                >
                  <Moon className="h-5 w-5 text-blue-600 mb-1 transition-transform group-hover:scale-110" />
                  <p className="text-sm font-medium text-blue-900">Sleep</p>
                </button>
                <button
                  onClick={() => navigate('/stress-log')}
                  className="px-3 py-3 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-all hover:shadow-sm group"
                >
                  <Brain className="h-5 w-5 text-yellow-600 mb-1 transition-transform group-hover:scale-110" />
                  <p className="text-sm font-medium text-yellow-900">Stress</p>
                </button>
                <button
                  onClick={() => navigate('/hydration-log')}
                  className="px-3 py-3 text-left bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-all hover:shadow-sm group"
                >
                  <Droplet className="h-5 w-5 text-cyan-600 mb-1 transition-transform group-hover:scale-110" />
                  <p className="text-sm font-medium text-cyan-900">Hydration</p>
                </button>
                <button
                  onClick={() => navigate('/medication-log')}
                  className="px-3 py-3 text-left bg-teal-50 hover:bg-teal-100 rounded-lg transition-all hover:shadow-sm col-span-2 group"
                >
                  <Pill className="h-5 w-5 text-teal-600 mb-1 transition-transform group-hover:scale-110" />
                  <p className="text-sm font-medium text-teal-900">Medication</p>
                </button>
              </div>
            </Card>
          </div>

          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About Your Health Dashboard</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                Your dashboard provides a real-time overview of your health metrics. All data is updated automatically as you log your daily activities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-teal-50 rounded-lg">
                  <p className="font-medium text-teal-900 mb-1">Track Consistently</p>
                  <p className="text-xs text-teal-700">Log your activities daily to unlock deeper insights and pattern recognition.</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900 mb-1">Data Privacy</p>
                  <p className="text-xs text-blue-700">Your health data is encrypted and private. Only you can access your information.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

```

## ./src/pages/Disclaimer.tsx

```
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Card from '../components/Card';
import { AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <h1 className="text-4xl font-bold text-gray-900">Medical Disclaimer</h1>
          </div>
          <p className="text-gray-600">Last updated: March 31, 2024</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <p className="text-yellow-800 font-medium">
            Important: Please read this disclaimer carefully before using GutWise
          </p>
        </div>

        <Card className="prose prose-yellow max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Not Medical Advice</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The information provided by GutWise is for informational and educational purposes only.
              It is not intended to be, and should not be interpreted as, medical advice, diagnosis, or
              treatment.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>GutWise does not provide medical advice.</strong> Always seek the advice of your
              physician or other qualified health provider with any questions you may have regarding a
              medical condition or treatment.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Never disregard professional medical advice or delay in seeking it because of something
              you have read on or accessed through GutWise.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Doctor-Patient Relationship</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Use of GutWise does not create a doctor-patient relationship between you and GutWise or
              any of its employees, contractors, or affiliated professionals.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The insights, recommendations, and information provided through our platform are generated
              by algorithms and should be reviewed with your healthcare provider before making any
              health-related decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Emergency Situations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>If you think you may have a medical emergency, call your doctor or 911
              immediately.</strong>
            </p>
            <p className="text-gray-700 leading-relaxed">
              GutWise is not designed for emergency situations. Do not use GutWise to seek help in an
              emergency. If you are experiencing severe symptoms, seek immediate medical attention.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Individual Results May Vary</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Health outcomes vary from person to person. Results, testimonials, or case studies
              presented on GutWise are not typical and should not be interpreted as guarantees of
              specific results.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Your individual results may differ based on numerous factors including but not limited to
              your current health status, genetics, lifestyle, adherence to recommendations, and other
              personal circumstances.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accuracy of Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              While we strive to provide accurate and up-to-date information, GutWise makes no
              representations or warranties regarding the accuracy, completeness, or reliability of any
              content on the platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Medical knowledge is constantly evolving. Information that is accurate today may be
              outdated tomorrow. We encourage you to verify any health information with current medical
              literature and your healthcare provider.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dietary Recommendations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Dietary suggestions provided by GutWise are general in nature and may not be suitable for
              everyone. Before making significant changes to your diet, consult with a registered
              dietitian or your healthcare provider.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This is especially important if you have:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Food allergies or intolerances</li>
              <li>Pre-existing medical conditions</li>
              <li>Are pregnant or nursing</li>
              <li>Are taking medications that may interact with certain foods</li>
              <li>Have a history of eating disorders</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Content</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              GutWise may contain links to third-party websites or content created by community members.
              We do not endorse, verify, or assume responsibility for the accuracy or reliability of any
              third-party information.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Users should independently verify any information before relying on it for health-related
              decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the fullest extent permitted by law, GutWise and its officers, directors, employees,
              and agents shall not be liable for any direct, indirect, incidental, special, or
              consequential damages arising from your use of the platform or reliance on any
              information provided.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This includes, but is not limited to, damages for loss of health, personal injury,
              emotional distress, or any other losses resulting from the use or inability to use
              GutWise.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibility</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You are solely responsible for your use of GutWise and for any decisions you make based
              on information obtained through the platform. You assume full responsibility for any risks
              associated with such use.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We strongly encourage you to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Maintain regular check-ups with your healthcare provider</li>
              <li>Discuss any insights or recommendations from GutWise with your doctor</li>
              <li>Report any adverse symptoms or reactions promptly to a medical professional</li>
              <li>Use GutWise as a complement to, not a replacement for, professional medical care</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acknowledgment and Acceptance</h2>
            <p className="text-gray-700 leading-relaxed">
              By using GutWise, you acknowledge that you have read, understood, and agree to be bound
              by this Medical Disclaimer. If you do not agree with any part of this disclaimer, you
              should not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions or Concerns</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about this Medical Disclaimer, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> legal@gutwise.com
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Address:</strong> 123 Health Plaza, Suite 400, San Francisco, CA 94105
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> 1-800-GUT-WISE (1-800-488-9473)
              </p>
            </div>
          </section>
        </Card>

        <div className="mt-8 text-center">
          <Link to="/" className="text-teal-600 hover:text-teal-700 font-medium">
            Return to Home
          </Link>
        </div>
      </main>
    </div>
  );
}

```

## ./src/pages/FoodLog.tsx

```
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Clock, Activity, Utensils } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatDateTime, toLocalDateTimeString, getLocalDateTimeString } from '../utils/dateFormatters';
import SuccessToast from '../components/SuccessToast';
import EmptyState from '../components/EmptyState';
import { getSuccessMessage, getUpdateMessage, getDeleteMessage } from '../utils/copySystem';
import { estimateCalories } from '../utils/calorieEstimator';

interface FoodLog {
  id?: string;
  logged_at: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_items: { name: string; quantity?: string; estimated_calories?: number }[];
  portion_size: string;
  notes: string;
}

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

const portionSizes = ['Small', 'Medium', 'Large', 'Extra Large'];

export default function FoodLog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [error, setError] = useState('');
  const dismissToast = useCallback(() => setToastVisible(false), []);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [foodItemInput, setFoodItemInput] = useState('');

  const getMealTypeFromParam = (): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    const mealParam = searchParams.get('meal');
    if (mealParam === 'breakfast' || mealParam === 'lunch' || mealParam === 'dinner' || mealParam === 'snack') {
      return mealParam;
    }
    return 'lunch';
  };

  const [formData, setFormData] = useState<FoodLog>({
    logged_at: getLocalDateTimeString(),
    meal_type: getMealTypeFromParam(),
    food_items: [],
    portion_size: 'Medium',
    notes: '',
  });

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user?.id)
      .order('logged_at', { ascending: false })
      .limit(50);

    if (data) {
      setHistory(data);
    }
  };

  const addFoodItem = () => {
    if (foodItemInput.trim()) {
      const estimate = estimateCalories(foodItemInput.trim());
      setFormData({
        ...formData,
        food_items: [
          ...formData.food_items,
          {
            name: foodItemInput.trim(),
            estimated_calories: estimate.calories,
          },
        ],
      });
      setFoodItemInput('');
    }
  };

  const removeFoodItem = (index: number) => {
    setFormData({
      ...formData,
      food_items: formData.food_items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const loggedAtTimestamp = new Date(formData.logged_at).toISOString();
      const totalCalories = formData.food_items.reduce(
        (sum, item) => sum + (item.estimated_calories || 0),
        0
      );

      if (editingId) {
        const { error } = await supabase
          .from('food_logs')
          .update({
            logged_at: loggedAtTimestamp,
            meal_type: formData.meal_type,
            food_items: formData.food_items,
            portion_size: formData.portion_size,
            calories: totalCalories,
            notes: formData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        setMessage(getUpdateMessage()); setToastVisible(true);
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('food_logs')
          .insert({
            user_id: user?.id,
            logged_at: loggedAtTimestamp,
            meal_type: formData.meal_type,
            food_items: formData.food_items,
            portion_size: formData.portion_size,
            calories: totalCalories,
            notes: formData.notes,
          });

        if (error) throw error;
        setMessage(getSuccessMessage('food')); setToastVisible(true);
      }

      resetForm();
      if (showHistory) {
        fetchHistory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      logged_at: getLocalDateTimeString(),
      meal_type: getMealTypeFromParam(),
      food_items: [],
      portion_size: 'Medium',
      notes: '',
    });
    setEditingId(null);
    setFoodItemInput('');
  };

  const handleEdit = (log: any) => {
    setFormData({
      logged_at: toLocalDateTimeString(log.logged_at),
      meal_type: log.meal_type,
      food_items: log.food_items || [],
      portion_size: log.portion_size || 'Medium',
      notes: log.notes || '',
    });
    setEditingId(log.id);
    setShowHistory(false);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', id);

    if (error) {
      setError('Failed to delete entry');
    } else {
      setMessage(getDeleteMessage()); setToastVisible(true);
      fetchHistory();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Food Intake Log</h1>
              <p className="text-gray-600 mt-2">Track meals, snacks, and dietary patterns</p>
            </div>

            <SuccessToast message={message} visible={toastVisible} onDismiss={dismissToast} />

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="mb-4 flex gap-3">
              <Button
                variant={!showHistory ? 'primary' : 'secondary'}
                onClick={() => setShowHistory(false)}
              >
                <Activity className="h-4 w-4 mr-2" />
                New Entry
              </Button>
              <Button
                variant={showHistory ? 'primary' : 'secondary'}
                onClick={() => setShowHistory(true)}
              >
                <Clock className="h-4 w-4 mr-2" />
                History
              </Button>
            </div>

            {!showHistory ? (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {editingId ? 'Edit Entry' : 'Log New Entry'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="logged_at" className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Time
                    </label>
                    <input
                      type="datetime-local"
                      id="logged_at"
                      value={formData.logged_at}
                      onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Meal Type
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {mealTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, meal_type: type.value as any })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.meal_type === type.value
                              ? 'border-teal-500 bg-teal-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Utensils className="h-6 w-6 mx-auto mb-2 text-gray-700" />
                          <div className="text-sm font-medium text-gray-900">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Food Items
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={foodItemInput}
                        onChange={(e) => setFoodItemInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFoodItem())}
                        placeholder="Add food item..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <Button type="button" onClick={addFoodItem}>
                        Add
                      </Button>
                    </div>
                    {formData.food_items.length > 0 && (
                      <div className="space-y-2">
                        {formData.food_items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                {item.estimated_calories !== undefined && (
                                  <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">
                                    {item.estimated_calories} cal
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFoodItem(index)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Portion Size
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {portionSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFormData({ ...formData, portion_size: size })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.portion_size === size
                              ? 'border-teal-500 bg-teal-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900">{size}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows={3}
                      placeholder="Location, mood, cravings, etc..."
                    />
                  </div>

                  {formData.food_items.length > 0 && (
                    <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                      <p className="text-sm text-teal-700">
                        <span className="font-semibold">Total Estimated Calories:</span>{' '}
                        {formData.food_items.reduce(
                          (sum, item) => sum + (item.estimated_calories || 0),
                          0
                        )}{' '}
                        cal
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button type="submit" disabled={saving}>
                      <Save className="inline h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="secondary" onClick={resetForm}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            ) : (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Entry History</h2>
                {history.length === 0 ? (
                  <EmptyState category="food" icon={<Utensils className="h-8 w-8 text-gray-400" />} />
                ) : (
                  <div className="space-y-4">
                    {history.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDateTime(log.logged_at)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 capitalize">
                              {log.meal_type} • {log.portion_size}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(log)}
                              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {log.food_items && log.food_items.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-1">Foods:</div>
                            <div className="flex flex-wrap gap-1">
                              {log.food_items.map((item: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800"
                                >
                                  {item.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {log.notes && (
                          <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {log.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

```

## ./src/pages/HydrationLog.tsx

```
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Clock, Activity, Droplet } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatDateTime, toLocalDateTimeString, getLocalDateTimeString } from '../utils/dateFormatters';
import SuccessToast from '../components/SuccessToast';
import EmptyState from '../components/EmptyState';
import { getSuccessMessage, getUpdateMessage, getDeleteMessage } from '../utils/copySystem';

interface HydrationLog {
  id?: string;
  logged_at: string;
  amount_ml: number;
  beverage_type: string;
  caffeine_content: boolean;
  notes: string;
}

const beverageTypes = [
  { label: 'Water', value: 'Water', ml: 250 },
  { label: 'Coffee', value: 'Coffee', ml: 240 },
  { label: 'Tea', value: 'Tea', ml: 240 },
  { label: 'Juice', value: 'Juice', ml: 200 },
  { label: 'Soda', value: 'Soda', ml: 330 },
  { label: 'Sports Drink', value: 'Sports Drink', ml: 500 },
  { label: 'Milk', value: 'Milk', ml: 250 },
  { label: 'Other', value: 'Other', ml: 250 },
];

const quickAmounts = [250, 350, 500, 750, 1000];

export default function HydrationLog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [error, setError] = useState('');
  const dismissToast = useCallback(() => setToastVisible(false), []);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<HydrationLog>({
    logged_at: getLocalDateTimeString(),
    amount_ml: 250,
    beverage_type: 'Water',
    caffeine_content: false,
    notes: '',
  });

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('hydration_logs')
      .select('*')
      .eq('user_id', user?.id)
      .order('logged_at', { ascending: false })
      .limit(50);

    if (data) {
      setHistory(data);
    }
  };

  const handleBeverageTypeChange = (type: string) => {
    const beverage = beverageTypes.find((b) => b.value === type);
    const hasCaffeine = type === 'Coffee' || type === 'Tea' || type === 'Soda';
    setFormData({
      ...formData,
      beverage_type: type,
      amount_ml: beverage?.ml || 250,
      caffeine_content: hasCaffeine,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const loggedAtTimestamp = new Date(formData.logged_at).toISOString();

      if (editingId) {
        const { error } = await supabase
          .from('hydration_logs')
          .update({
            logged_at: loggedAtTimestamp,
            amount_ml: formData.amount_ml,
            beverage_type: formData.beverage_type,
            caffeine_content: formData.caffeine_content,
            notes: formData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        setMessage(getUpdateMessage()); setToastVisible(true);
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('hydration_logs')
          .insert({
            user_id: user?.id,
            logged_at: loggedAtTimestamp,
            amount_ml: formData.amount_ml,
            beverage_type: formData.beverage_type,
            caffeine_content: formData.caffeine_content,
            notes: formData.notes,
          });

        if (error) throw error;
        setMessage(getSuccessMessage('hydration')); setToastVisible(true);
      }

      resetForm();
      if (showHistory) {
        fetchHistory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      logged_at: getLocalDateTimeString(),
      amount_ml: 250,
      beverage_type: 'Water',
      caffeine_content: false,
      notes: '',
    });
    setEditingId(null);
  };

  const handleEdit = (log: any) => {
    setFormData({
      logged_at: toLocalDateTimeString(log.logged_at),
      amount_ml: log.amount_ml,
      beverage_type: log.beverage_type,
      caffeine_content: log.caffeine_content || false,
      notes: log.notes || '',
    });
    setEditingId(log.id);
    setShowHistory(false);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const { error } = await supabase
      .from('hydration_logs')
      .delete()
      .eq('id', id);

    if (error) {
      setError('Failed to delete entry');
    } else {
      setMessage(getDeleteMessage()); setToastVisible(true);
      fetchHistory();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Hydration Log</h1>
              <p className="text-gray-600 mt-2">Track fluid intake and beverage types</p>
            </div>

            <SuccessToast message={message} visible={toastVisible} onDismiss={dismissToast} />

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="mb-4 flex gap-3">
              <Button
                variant={!showHistory ? 'primary' : 'secondary'}
                onClick={() => setShowHistory(false)}
              >
                <Activity className="h-4 w-4 mr-2" />
                New Entry
              </Button>
              <Button
                variant={showHistory ? 'primary' : 'secondary'}
                onClick={() => setShowHistory(true)}
              >
                <Clock className="h-4 w-4 mr-2" />
                History
              </Button>
            </div>

            {!showHistory ? (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {editingId ? 'Edit Entry' : 'Log New Entry'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="logged_at" className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Time
                    </label>
                    <input
                      type="datetime-local"
                      id="logged_at"
                      value={formData.logged_at}
                      onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Droplet className="inline h-4 w-4 mr-1" />
                      Beverage Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {beverageTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleBeverageTypeChange(type.value)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.beverage_type === type.value
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Droplet className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                          <div className="text-sm font-medium text-gray-900">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Quick Amount (ml)
                    </label>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setFormData({ ...formData, amount_ml: amount })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.amount_ml === amount
                              ? 'border-teal-500 bg-teal-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900">{amount}</div>
                        </button>
                      ))}
                    </div>
                    <label htmlFor="amount_ml" className="block text-sm font-medium text-gray-700 mb-2">
                      Or Enter Custom Amount (ml)
                    </label>
                    <input
                      type="number"
                      id="amount_ml"
                      value={formData.amount_ml}
                      onChange={(e) => setFormData({ ...formData, amount_ml: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Contains Caffeine</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, caffeine_content: !formData.caffeine_content })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.caffeine_content ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.caffeine_content ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows={3}
                      placeholder="Additional details..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={saving}>
                      <Save className="inline h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="secondary" onClick={resetForm}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            ) : (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Entry History</h2>
                {history.length === 0 ? (
                  <EmptyState category="hydration" icon={<Droplet className="h-8 w-8 text-gray-400" />} />
                ) : (
                  <div className="space-y-4">
                    {history.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDateTime(log.logged_at)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {log.beverage_type} • {log.amount_ml}ml
                              {log.caffeine_content && ' • Contains Caffeine'}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(log)}
                              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {log.notes && (
                          <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {log.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

```

## ./src/pages/Insights.tsx

```
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import InsightCard from '../components/InsightCard';
import { Brain, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generateAllInsights, saveInsights, getUserInsights, Insight } from '../utils/insightEngine';

export default function Insights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user]);

  const loadInsights = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getUserInsights(user.id);
      setInsights(data);
    } catch (err) {
      console.error('Error loading insights:', err);
      setError('Failed to load insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    if (!user) return;

    try {
      setGenerating(true);
      setError(null);
      const newInsights = await generateAllInsights(user.id);

      if (newInsights.length > 0) {
        await saveInsights(newInsights);
        await loadInsights();
      } else {
        setError('Not enough data to generate insights yet. Keep logging your daily activities!');
      }
    } catch (err) {
      console.error('Error generating insights:', err);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Insights</h1>
              <p className="text-gray-600">Rule-based pattern analysis of your digestive health data</p>
            </div>
            <Button
              onClick={handleGenerateInsights}
              disabled={generating}
              className="flex items-center gap-2"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : insights.length === 0 ? (
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
              style={{ animation: 'emptyStateFadeIn 0.4s ease-out both' }}
            >
              <div
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-teal-50 flex items-center justify-center"
                style={{ animation: 'emptyStateIconFloat 3s ease-in-out infinite' }}
              >
                <Brain className="h-10 w-10 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Insights Are Brewing</h3>
              <p className="text-sm text-gray-500 mb-2 max-w-md mx-auto leading-relaxed">
                We need a few days of data to find meaningful patterns. The more you log, the smarter your insights become.
              </p>
              <p className="text-xs text-gray-400 mb-8 max-w-sm mx-auto">
                Try logging across different categories -- meals, symptoms, sleep -- for the richest analysis.
              </p>
              <Button onClick={handleGenerateInsights} disabled={generating}>
                {generating ? 'Analyzing...' : 'Generate First Insights'}
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-1">How Insights Work</h3>
                <p className="text-sm text-blue-800">
                  All insights are generated using transparent, rule-based analysis. No black-box algorithms are used.
                  Each pattern requires multiple consistent observations before being reported. Confidence levels reflect
                  the frequency and consistency of observed patterns.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

```

## ./src/pages/Landing.tsx

```
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import {
  Brain,
  Shield,
  TrendingUp,
  Users,
  Lock,
  Award,
  ChevronRight,
  Activity
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: Brain,
      title: 'Personalized Insights',
      description: 'AI-powered analysis tailored to your unique gut microbiome and health patterns.',
    },
    {
      icon: TrendingUp,
      title: 'Track Your Progress',
      description: 'Monitor improvements over time with detailed charts and actionable recommendations.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your health data is encrypted and never shared without your explicit consent.',
    },
    {
      icon: Users,
      title: 'Expert Community',
      description: 'Connect with others on similar journeys and learn from certified health professionals.',
    },
  ];

  const trustSignals = [
    { icon: Lock, text: 'HIPAA Compliant' },
    { icon: Shield, text: 'Bank-Level Encryption' },
    { icon: Award, text: 'Medically Reviewed' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <Header />

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-medium mb-8">
              <Activity className="h-4 w-4" />
              <span>Your gut's new best friend</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Unlock the Power of Your
              <span className="block text-teal-600">Gut Health Intelligence</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your digestive wellness with personalized insights, expert guidance,
              and a supportive community. Because your gut feeling deserves data-driven confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Journey
                  <ChevronRight className="inline ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Log In
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-gray-600">
              {trustSignals.map((signal) => {
                const Icon = signal.icon;
                return (
                  <div key={signal.text} className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-teal-600" />
                    <span>{signal.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Thrive
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and insights to help you understand and improve your gut health
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="bg-gradient-to-r from-teal-600 to-blue-600 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Take Control of Your Gut Health?
            </h2>
            <p className="text-xl text-teal-50 mb-8">
              Join thousands of users who have transformed their digestive wellness
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-50">
                Get Started Free
              </Button>
            </Link>
            <p className="text-sm text-teal-100 mt-4">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </section>

        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-6 w-6 text-teal-600" />
                  <span className="text-lg font-bold text-gray-900">GutWise</span>
                </div>
                <p className="text-sm text-gray-600">
                  Empowering you with personalized gut health intelligence
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link to="/" className="hover:text-gray-900">Features</Link></li>
                  <li><Link to="/" className="hover:text-gray-900">Pricing</Link></li>
                  <li><Link to="/" className="hover:text-gray-900">FAQ</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link to="/" className="hover:text-gray-900">About</Link></li>
                  <li><Link to="/" className="hover:text-gray-900">Blog</Link></li>
                  <li><Link to="/" className="hover:text-gray-900">Careers</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link to="/privacy" className="hover:text-gray-900">Privacy Policy</Link></li>
                  <li><Link to="/disclaimer" className="hover:text-gray-900">Medical Disclaimer</Link></li>
                  <li><Link to="/" className="hover:text-gray-900">Terms of Service</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
              <p>&copy; 2024 GutWise. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

```

## ./src/pages/Login.tsx

```
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Activity className="h-8 w-8 text-teal-600" />
          <span className="text-2xl font-bold text-gray-900">GutWise</span>
        </Link>

        <Card>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Your health data is right where you left it.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <Link to="/forgot-password" className="text-sm font-medium text-teal-600 hover:text-teal-700">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Logging In...' : 'Log In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-teal-600 hover:text-teal-700">
                Sign up for free
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Lock className="h-4 w-4" />
              <span>Secure login protected by 256-bit encryption</span>
            </div>
          </div>
        </Card>

        <p className="mt-8 text-center text-xs text-gray-500">
          By logging in, you agree to our{' '}
          <Link to="/privacy" className="text-teal-600 hover:text-teal-700">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link to="/disclaimer" className="text-teal-600 hover:text-teal-700">
            Medical Disclaimer
          </Link>
        </p>
      </div>
    </div>
  );
}

```

## ./src/pages/Meals.tsx

```
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import { UtensilsCrossed, Plus, Calendar } from 'lucide-react';
import { useMealStatistics } from '../hooks/useMealStatistics';

export default function Meals() {
  const navigate = useNavigate();
  const { statistics } = useMealStatistics();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meal Tracking</h1>
              <p className="text-gray-600">Log and analyze your daily food intake</p>
            </div>
            <Button onClick={() => navigate('/food-log')} className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Log Meal
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Today's Meals</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.todayMealCount}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Calories</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.totalCalories}</p>
              </div>
            </Card>
          </div>

          <Card className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6 text-teal-600" />
              <h2 className="text-xl font-semibold text-gray-900">Today's Log</h2>
            </div>
            <div className="space-y-4">
              {['Breakfast', 'Lunch', 'Dinner'].map((meal) => (
                <div key={meal} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UtensilsCrossed className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{meal}</p>
                        <p className="text-sm text-gray-500">Tap to add meals</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/food-log?meal=${meal.toLowerCase()}`)}>Add</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

```

## ./src/pages/MedicationLog.tsx

```
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Clock, Activity, Pill } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatDateTime, toLocalDateTimeString, getLocalDateTimeString } from '../utils/dateFormatters';
import SuccessToast from '../components/SuccessToast';
import EmptyState from '../components/EmptyState';
import { getSuccessMessage, getUpdateMessage, getDeleteMessage } from '../utils/copySystem';

interface MedicationLog {
  id?: string;
  logged_at: string;
  medication_name: string;
  dosage: string;
  medication_type: 'prescription' | 'otc' | 'supplement';
  taken_as_prescribed: boolean;
  side_effects: string[];
  notes: string;
}

const commonSideEffects = [
  'Drowsiness',
  'Nausea',
  'Dizziness',
  'Headache',
  'Dry Mouth',
  'Upset Stomach',
  'Fatigue',
  'None',
];

export default function MedicationLog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [error, setError] = useState('');
  const dismissToast = useCallback(() => setToastVisible(false), []);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<MedicationLog>({
    logged_at: getLocalDateTimeString(),
    medication_name: '',
    dosage: '',
    medication_type: 'prescription',
    taken_as_prescribed: true,
    side_effects: [],
    notes: '',
  });

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('user_id', user?.id)
      .order('logged_at', { ascending: false })
      .limit(50);

    if (data) {
      setHistory(data);
    }
  };

  const toggleSideEffect = (effect: string) => {
    if (effect === 'None') {
      setFormData({ ...formData, side_effects: ['None'] });
    } else {
      const filtered = formData.side_effects.filter((e) => e !== 'None');
      setFormData({
        ...formData,
        side_effects: filtered.includes(effect)
          ? filtered.filter((e) => e !== effect)
          : [...filtered, effect],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const loggedAtTimestamp = new Date(formData.logged_at).toISOString();

      if (editingId) {
        const { error } = await supabase
          .from('medication_logs')
          .update({
            logged_at: loggedAtTimestamp,
            medication_name: formData.medication_name,
            dosage: formData.dosage,
            medication_type: formData.medication_type,
            taken_as_prescribed: formData.taken_as_prescribed,
            side_effects: formData.side_effects,
            notes: formData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        setMessage(getUpdateMessage()); setToastVisible(true);
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('medication_logs')
          .insert({
            user_id: user?.id,
            logged_at: loggedAtTimestamp,
            medication_name: formData.medication_name,
            dosage: formData.dosage,
            medication_type: formData.medication_type,
            taken_as_prescribed: formData.taken_as_prescribed,
            side_effects: formData.side_effects,
            notes: formData.notes,
          });

        if (error) throw error;
        setMessage(getSuccessMessage('medication')); setToastVisible(true);
      }

      resetForm();
      if (showHistory) {
        fetchHistory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      logged_at: getLocalDateTimeString(),
      medication_name: '',
      dosage: '',
      medication_type: 'prescription',
      taken_as_prescribed: true,
      side_effects: [],
      notes: '',
    });
    setEditingId(null);
  };

  const handleEdit = (log: any) => {
    setFormData({
      logged_at: toLocalDateTimeString(log.logged_at),
      medication_name: log.medication_name,
      dosage: log.dosage,
      medication_type: log.medication_type,
      taken_as_prescribed: log.taken_as_prescribed !== false,
      side_effects: log.side_effects || [],
      notes: log.notes || '',
    });
    setEditingId(log.id);
    setShowHistory(false);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const { error } = await supabase
      .from('medication_logs')
      .delete()
      .eq('id', id);

    if (error) {
      setError('Failed to delete entry');
    } else {
      setMessage(getDeleteMessage()); setToastVisible(true);
      fetchHistory();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Medication Log</h1>
              <p className="text-gray-600 mt-2">Track medications, dosages, and adherence</p>
            </div>

            <SuccessToast message={message} visible={toastVisible} onDismiss={dismissToast} />

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="mb-4 flex gap-3">
              <Button
                variant={!showHistory ? 'primary' : 'secondary'}
                onClick={() => setShowHistory(false)}
              >
                <Activity className="h-4 w-4 mr-2" />
                New Entry
              </Button>
              <Button
                variant={showHistory ? 'primary' : 'secondary'}
                onClick={() => setShowHistory(true)}
              >
                <Clock className="h-4 w-4 mr-2" />
                History
              </Button>
            </div>

            {!showHistory ? (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {editingId ? 'Edit Entry' : 'Log New Entry'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="logged_at" className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Time Taken
                    </label>
                    <input
                      type="datetime-local"
                      id="logged_at"
                      value={formData.logged_at}
                      onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="medication_name" className="block text-sm font-medium text-gray-700 mb-2">
                      <Pill className="inline h-4 w-4 mr-1" />
                      Medication Name
                    </label>
                    <input
                      type="text"
                      id="medication_name"
                      value={formData.medication_name}
                      onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                      placeholder="e.g., Ibuprofen, Vitamin D..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-2">
                      Dosage
                    </label>
                    <input
                      type="text"
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="e.g., 200mg, 1 tablet, 5ml..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Medication Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, medication_type: 'prescription' })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.medication_type === 'prescription'
                            ? 'border-teal-500 bg-teal-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900">Prescription</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, medication_type: 'otc' })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.medication_type === 'otc'
                            ? 'border-teal-500 bg-teal-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900">Over-the-Counter</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, medication_type: 'supplement' })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.medication_type === 'supplement'
                            ? 'border-teal-500 bg-teal-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900">Supplement</div>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Taken as Prescribed</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, taken_as_prescribed: !formData.taken_as_prescribed })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.taken_as_prescribed ? 'bg-teal-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.taken_as_prescribed ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Side Effects (Optional)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {commonSideEffects.map((effect) => (
                        <button
                          key={effect}
                          type="button"
                          onClick={() => toggleSideEffect(effect)}
                          className={`p-3 rounded-lg border-2 transition-all text-sm ${
                            formData.side_effects.includes(effect)
                              ? 'border-red-500 bg-red-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {effect}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows={3}
                      placeholder="Reason for taking, effectiveness, etc..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={saving}>
                      <Save className="inline h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="secondary" onClick={resetForm}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            ) : (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Entry History</h2>
                {history.length === 0 ? (
                  <EmptyState category="medication" icon={<Pill className="h-8 w-8 text-gray-400" />} />
                ) : (
                  <div className="space-y-4">
                    {history.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDateTime(log.logged_at)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {log.medication_name} • {log.dosage}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(log)}
                              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs mb-2">
                          <div>
                            <span className="text-gray-500">Type:</span>
                            <span className="ml-1 font-medium capitalize">{log.medication_type}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">As Prescribed:</span>
                            <span className="ml-1 font-medium">{log.taken_as_prescribed ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                        {log.side_effects && log.side_effects.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-1">Side Effects:</div>
                            <div className="flex flex-wrap gap-1">
                              {log.side_effects.map((effect: string, idx: number) => (
                                <span
                                  key={idx}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                    effect === 'None'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {effect}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {log.notes && (
                          <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {log.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

```

## ./src/pages/Privacy.tsx

```
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Card from '../components/Card';
import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-teal-600" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600">Last updated: March 31, 2024</p>
        </div>

        <Card className="prose prose-teal max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              At GutWise, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our gut health intelligence
              platform. Please read this policy carefully.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using GutWise, you agree to the collection and use of information in accordance with
              this policy. If you do not agree with our policies and practices, please do not use our
              services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Name, email address, and account credentials</li>
              <li>Health information including symptoms, dietary habits, and wellness data</li>
              <li>Demographic information such as age, gender, and location</li>
              <li>Communication preferences and support inquiries</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Automatically Collected Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you access our services, we automatically collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Device information and IP address</li>
              <li>Browser type and operating system</li>
              <li>Usage data and interaction patterns</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide, maintain, and improve our services</li>
              <li>Generate personalized health insights and recommendations</li>
              <li>Communicate with you about your account and updates</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations and protect rights</li>
              <li>Conduct research and development with de-identified data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>256-bit encryption for data transmission and storage</li>
              <li>HIPAA-compliant infrastructure and practices</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and employee training programs</li>
              <li>Secure backup and disaster recovery procedures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights and Choices</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Access and review your personal information</li>
              <li>Request corrections or updates to your data</li>
              <li>Delete your account and associated data</li>
              <li>Export your health data in a portable format</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide
              services. When you delete your account, we will delete or anonymize your personal
              information within 30 days, except where we are required to retain it for legal or
              regulatory purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share limited information with trusted third-party service providers who assist us
              in operating our platform. These partners are bound by strict confidentiality agreements
              and may only use your information to provide services on our behalf.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We do not sell your personal health information to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              GutWise is not intended for individuals under the age of 18. We do not knowingly collect
              personal information from children. If you believe we have collected information from a
              child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by
              posting the new policy on this page and updating the "Last updated" date. We encourage you
              to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> privacy@gutwise.com
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Address:</strong> 123 Health Plaza, Suite 400, San Francisco, CA 94105
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> 1-800-GUT-WISE (1-800-488-9473)
              </p>
            </div>
          </section>
        </Card>

        <div className="mt-8 text-center">
          <Link to="/" className="text-teal-600 hover:text-teal-700 font-medium">
            Return to Home
          </Link>
        </div>
      </main>
    </div>
  );
}

```

## ./src/pages/Reports.tsx

```
import { useState, useEffect } from 'react';
import { Printer, Download, FileText } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import DateRangeSelector from '../components/reports/DateRangeSelector';
import ExecutiveSummary from '../components/reports/ExecutiveSummary';
import BMAnalyticsSection from '../components/reports/BMAnalyticsSection';
import BristolDistributionSection from '../components/reports/BristolDistributionSection';
import SymptomProgressionSection from '../components/reports/SymptomProgressionSection';
import HealthMarkersSection from '../components/reports/HealthMarkersSection';
import TriggerPatternsSection from '../components/reports/TriggerPatternsSection';
import MedicationCorrelationSection from '../components/reports/MedicationCorrelationSection';
import ClinicalAlertsSection from '../components/reports/ClinicalAlertsSection';
import {
  fetchBMAnalytics,
  fetchBristolDistribution,
  fetchSymptomTrends,
  fetchHealthMarkerCorrelation,
  fetchTriggerPatterns,
  fetchMedicationCorrelation,
  generateClinicalAlerts,
  BMAnalytics,
  BristolDistribution,
  SymptomTrend,
  HealthMarkerCorrelation,
  TriggerPattern,
  MedicationCorrelation,
  ClinicalAlert,
} from '../utils/clinicalReportQueries';

export default function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [bmAnalytics, setBmAnalytics] = useState<BMAnalytics | null>(null);
  const [bristolDistribution, setBristolDistribution] = useState<BristolDistribution[]>([]);
  const [symptomTrends, setSymptomTrends] = useState<SymptomTrend[]>([]);
  const [healthMarkers, setHealthMarkers] = useState<HealthMarkerCorrelation[]>([]);
  const [triggerPatterns, setTriggerPatterns] = useState<TriggerPattern[]>([]);
  const [medicationCorrelations, setMedicationCorrelations] = useState<MedicationCorrelation[]>([]);
  const [clinicalAlerts, setClinicalAlerts] = useState<ClinicalAlert[]>([]);

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user, startDate, endDate]);

  const loadReportData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const dateRange = { startDate, endDate };

      const [
        analytics,
        distribution,
        trends,
        markers,
        triggers,
        medications,
        alerts,
      ] = await Promise.all([
        fetchBMAnalytics(user.id, dateRange),
        fetchBristolDistribution(user.id, dateRange),
        fetchSymptomTrends(user.id, dateRange),
        fetchHealthMarkerCorrelation(user.id, dateRange),
        fetchTriggerPatterns(user.id, dateRange),
        fetchMedicationCorrelation(user.id, dateRange),
        generateClinicalAlerts(user.id, dateRange),
      ]);

      setBmAnalytics(analytics);
      setBristolDistribution(distribution);
      setSymptomTrends(trends);
      setHealthMarkers(markers);
      setTriggerPatterns(triggers);
      setMedicationCorrelations(medications);
      setClinicalAlerts(alerts);
    } catch (err) {
      console.error('Error loading report data:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    window.print();
  };

  const formatDateRange = () => {
    const start = new Date(startDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const end = new Date(endDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    return `${start} - ${end}`;
  };

  const getPrimaryConcerns = (): string[] => {
    const concerns: string[] = [];

    if (bmAnalytics) {
      if (bmAnalytics.averagePerDay > 6) {
        concerns.push(`Elevated bowel movement frequency (${bmAnalytics.averagePerDay.toFixed(1)}/day) exceeding normal physiological range`);
      } else if (bmAnalytics.averagePerDay < 1) {
        concerns.push(`Reduced bowel movement frequency (${bmAnalytics.averagePerDay.toFixed(1)}/day) suggesting constipation`);
      }
    }

    const normalBristol = bristolDistribution.filter(d => d.type === 3 || d.type === 4);
    const normalPercentage = normalBristol.reduce((sum, d) => sum + d.percentage, 0);
    if (bristolDistribution.length > 0 && normalPercentage < 40) {
      concerns.push(`Stool consistency abnormalities with only ${normalPercentage.toFixed(0)}% within normal Bristol Scale parameters`);
    }

    const worseningSymptoms = symptomTrends.filter(t => {
      const symptomData = symptomTrends.filter(st => st.symptomType === t.symptomType).sort((a, b) => a.date.localeCompare(b.date));
      if (symptomData.length < 2) return false;
      const first = symptomData[0].avgSeverity;
      const last = symptomData[symptomData.length - 1].avgSeverity;
      return last - first > 1;
    });

    if (worseningSymptoms.length > 0) {
      const uniqueSymptoms = Array.from(new Set(worseningSymptoms.map(s => s.symptomType)));
      concerns.push(`Progressive symptom worsening noted in: ${uniqueSymptoms.join(', ')}`);
    }

    if (triggerPatterns.length > 0) {
      const highRiskTriggers = triggerPatterns.filter(t => t.correlationStrength > 0.6);
      if (highRiskTriggers.length > 0) {
        concerns.push(`Strong dietary trigger correlations identified for: ${highRiskTriggers.map(t => t.trigger).slice(0, 3).join(', ')}`);
      }
    }

    return concerns;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 print:ml-0 print:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 print:hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Clinical Report</h1>
                <p className="text-gray-600">Professional digestive health documentation for healthcare consultation</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-5 w-5" />
                  Print
                </Button>
                <Button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Export PDF
                </Button>
              </div>
            </div>

            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>

          <div className="hidden print:block mb-8">
            <div className="border-b-4 border-gray-900 pb-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-8 w-8 text-gray-900" />
                <h1 className="text-4xl font-bold text-gray-900">Clinical Digestive Health Report</h1>
              </div>
              <p className="text-gray-700 text-lg">Professional Medical Documentation</p>
              <p className="text-sm text-gray-600 mt-2">
                Generated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {loading && (
            <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Generating clinical report...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && bmAnalytics && (
            <>
              <ExecutiveSummary
                dateRange={formatDateRange()}
                totalBMs={bmAnalytics.totalCount}
                avgPerDay={bmAnalytics.averagePerDay}
                avgPerWeek={bmAnalytics.averagePerWeek}
                criticalAlerts={clinicalAlerts.filter(a => a.severity === 'critical' || a.severity === 'high')}
                primaryConcerns={getPrimaryConcerns()}
              />

              <ClinicalAlertsSection alerts={clinicalAlerts} />

              <BMAnalyticsSection analytics={bmAnalytics} />

              <BristolDistributionSection distribution={bristolDistribution} />

              <SymptomProgressionSection trends={symptomTrends} />

              <HealthMarkersSection correlations={healthMarkers} />

              <TriggerPatternsSection triggers={triggerPatterns} />

              <MedicationCorrelationSection correlations={medicationCorrelations} />

              <div className="bg-white border-t-4 border-gray-900 rounded-lg p-6 mt-8 print:mt-12">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Clinical Recommendations</h2>
                <div className="space-y-3 text-sm text-gray-800 leading-relaxed">
                  <p>
                    <span className="font-semibold">1. Comprehensive Evaluation:</span> Review findings with gastroenterologist
                    for differential diagnosis and treatment optimization.
                  </p>
                  <p>
                    <span className="font-semibold">2. Follow-up Timeline:</span> Schedule reassessment in 4-6 weeks to evaluate
                    therapeutic response and symptom progression.
                  </p>
                  <p>
                    <span className="font-semibold">3. Diagnostic Considerations:</span> Consider laboratory studies (CBC, CMP, inflammatory
                    markers, celiac panel) and imaging as clinically indicated based on symptom severity.
                  </p>
                  <p>
                    <span className="font-semibold">4. Patient Education:</span> Continue systematic symptom tracking for longitudinal
                    trend analysis and treatment efficacy assessment.
                  </p>
                </div>
              </div>

              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mt-4 print:mt-8">
                <p className="text-xs text-gray-700 leading-relaxed">
                  <span className="font-semibold">Disclaimer:</span> This report is generated from patient-reported data and is intended
                  to facilitate clinical consultation. It does not constitute medical diagnosis or treatment recommendation. All clinical
                  decisions should be made by qualified healthcare professionals based on comprehensive patient assessment, physical examination,
                  and appropriate diagnostic testing. Data accuracy is dependent on patient compliance with systematic logging protocols.
                </p>
              </div>

              <div className="text-center text-xs text-gray-500 mt-6 print:mt-12 pb-4">
                <p>End of Clinical Report</p>
                <p className="mt-1">This document contains protected health information. Handle in accordance with HIPAA requirements.</p>
              </div>
            </>
          )}
        </div>
      </main>

      <style>{`
        @media print {
          body {
            background: white;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:block {
            display: block !important;
          }

          .print\\:ml-0 {
            margin-left: 0 !important;
          }

          .print\\:p-8 {
            padding: 2rem !important;
          }

          .print\\:mt-12 {
            margin-top: 3rem !important;
          }

          .print\\:mt-8 {
            margin-top: 2rem !important;
          }

          .print\\:border-0 {
            border: 0 !important;
          }

          .print\\:p-0 {
            padding: 0 !important;
          }

          .print\\:border-gray-800 {
            border-color: #1f2937 !important;
          }

          @page {
            margin: 0.75in;
            size: letter;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .page-break {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
}

```

## ./src/pages/Settings.tsx

```
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import { User, Bell, Lock, CreditCard, Shield, Globe, HelpCircle } from 'lucide-react';

export default function Settings() {
  const sections = [
    {
      title: 'Profile',
      icon: User,
      description: 'Manage your personal information and profile details',
    },
    {
      title: 'Notifications',
      icon: Bell,
      description: 'Control how and when you receive updates',
    },
    {
      title: 'Privacy & Security',
      icon: Lock,
      description: 'Manage your data privacy and security settings',
    },
    {
      title: 'Billing',
      icon: CreditCard,
      description: 'View and manage your subscription and payment methods',
    },
    {
      title: 'Data Management',
      icon: Shield,
      description: 'Export, backup, or delete your health data',
    },
    {
      title: 'Preferences',
      icon: Globe,
      description: 'Customize your experience and app preferences',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>

          <div className="space-y-4 mb-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} padding="md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{section.description}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="ml-4">
                      Configure
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Our support team is here to assist you with any questions or concerns
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                  <Button variant="outline" size="sm">
                    View Documentation
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <Card padding="md" className="border-yellow-200 bg-yellow-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-900">Pause Your Account</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Temporarily disable your account without losing data
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                    Pause
                  </Button>
                </div>
              </Card>

              <Card padding="md" className="border-red-200 bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-900">Delete Account</p>
                    <p className="text-sm text-red-700 mt-1">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                    Delete
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

```

## ./src/pages/Signup.tsx

```
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, User } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signUp(email, password, name);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Activity className="h-8 w-8 text-teal-600" />
          <span className="text-2xl font-bold text-gray-900">GutWise</span>
        </Link>

        <Card>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-gray-600">Your gut health data belongs to you. Let us help you understand it.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Jane Smith"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Create a strong password"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Must be at least 8 characters with a mix of letters and numbers
              </p>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the{' '}
                  <Link to="/privacy" className="font-medium text-teal-600 hover:text-teal-700">
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link to="/disclaimer" className="font-medium text-teal-600 hover:text-teal-700">
                    Medical Disclaimer
                  </Link>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-teal-600 hover:text-teal-700">
                Log in
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Lock className="h-4 w-4" />
              <span>Your data is encrypted and HIPAA compliant</span>
            </div>
          </div>
        </Card>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800 text-center">
            <strong>Free 14-day trial</strong> - No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

```

## ./src/pages/SleepLog.tsx

```
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Clock, Activity, Moon } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatDateTime, toLocalDateTimeString, getLocalDateTimeString, getLocalDateTimeStringWithOffset } from '../utils/dateFormatters';
import SuccessToast from '../components/SuccessToast';
import EmptyState from '../components/EmptyState';
import { getSuccessMessage, getUpdateMessage, getDeleteMessage } from '../utils/copySystem';

interface SleepLog {
  id?: string;
  sleep_start: string;
  sleep_end: string;
  quality: number;
  interruptions: number;
  felt_rested: boolean;
  notes: string;
}

export default function SleepLog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [error, setError] = useState('');
  const dismissToast = useCallback(() => setToastVisible(false), []);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<SleepLog>({
    sleep_start: getLocalDateTimeStringWithOffset(-8),
    sleep_end: getLocalDateTimeStringWithOffset(),
    quality: 7,
    interruptions: 0,
    felt_rested: true,
    notes: '',
  });

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', user?.id)
      .order('sleep_start', { ascending: false })
      .limit(50);

    if (data) {
      setHistory(data);
    }
  };

  const calculateDuration = () => {
    if (formData.sleep_start && formData.sleep_end) {
      const start = new Date(formData.sleep_start);
      const end = new Date(formData.sleep_end);
      const diff = end.getTime() - start.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }
    return '0h 0m';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const sleepStartTimestamp = new Date(formData.sleep_start).toISOString();
      const sleepEndTimestamp = new Date(formData.sleep_end).toISOString();

      if (new Date(sleepEndTimestamp) <= new Date(sleepStartTimestamp)) {
        throw new Error('Sleep end time must be after start time');
      }

      if (editingId) {
        const { error } = await supabase
          .from('sleep_logs')
          .update({
            sleep_start: sleepStartTimestamp,
            sleep_end: sleepEndTimestamp,
            quality: formData.quality,
            interruptions: formData.interruptions,
            felt_rested: formData.felt_rested,
            notes: formData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        setMessage(getUpdateMessage()); setToastVisible(true);
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('sleep_logs')
          .insert({
            user_id: user?.id,
            sleep_start: sleepStartTimestamp,
            sleep_end: sleepEndTimestamp,
            quality: formData.quality,
            interruptions: formData.interruptions,
            felt_rested: formData.felt_rested,
            notes: formData.notes,
          });

        if (error) throw error;
        setMessage(getSuccessMessage('sleep')); setToastVisible(true);
      }

      resetForm();
      if (showHistory) {
        fetchHistory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sleep_start: getLocalDateTimeString(-8),
      sleep_end: getLocalDateTimeString(),
      quality: 7,
      interruptions: 0,
      felt_rested: true,
      notes: '',
    });
    setEditingId(null);
  };

  const handleEdit = (log: any) => {
    setFormData({
      sleep_start: toLocalDateTimeString(log.sleep_start),
      sleep_end: toLocalDateTimeString(log.sleep_end),
      quality: log.quality || 7,
      interruptions: log.interruptions || 0,
      felt_rested: log.felt_rested !== false,
      notes: log.notes || '',
    });
    setEditingId(log.id);
    setShowHistory(false);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const { error } = await supabase
      .from('sleep_logs')
      .delete()
      .eq('id', id);

    if (error) {
      setError('Failed to delete entry');
    } else {
      setMessage(getDeleteMessage()); setToastVisible(true);
      fetchHistory();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Sleep Log</h1>
              <p className="text-gray-600 mt-2">Track sleep patterns, quality, and restfulness</p>
            </div>

            <SuccessToast message={message} visible={toastVisible} onDismiss={dismissToast} />

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="mb-4 flex gap-3">
              <Button
                variant={!showHistory ? 'primary' : 'secondary'}
                onClick={() => setShowHistory(false)}
              >
                <Activity className="h-4 w-4 mr-2" />
                New Entry
              </Button>
              <Button
                variant={showHistory ? 'primary' : 'secondary'}
                onClick={() => setShowHistory(true)}
              >
                <Clock className="h-4 w-4 mr-2" />
                History
              </Button>
            </div>

            {!showHistory ? (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {editingId ? 'Edit Entry' : 'Log New Entry'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="sleep_start" className="block text-sm font-medium text-gray-700 mb-2">
                        <Moon className="inline h-4 w-4 mr-1" />
                        Bedtime
                      </label>
                      <input
                        type="datetime-local"
                        id="sleep_start"
                        value={formData.sleep_start}
                        onChange={(e) => setFormData({ ...formData, sleep_start: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="sleep_end" className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="inline h-4 w-4 mr-1" />
                        Wake Time
                      </label>
                      <input
                        type="datetime-local"
                        id="sleep_end"
                        value={formData.sleep_end}
                        onChange={(e) => setFormData({ ...formData, sleep_end: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-teal-50 rounded-lg">
                    <div className="text-sm font-medium text-teal-900">
                      Total Sleep Duration: <span className="text-lg">{calculateDuration()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sleep Quality: {formData.quality}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={formData.quality}
                      onChange={(e) => setFormData({ ...formData, quality: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      style={{
                        background: `linear-gradient(to right, rgb(20, 184, 166) 0%, rgb(20, 184, 166) ${((formData.quality - 1) / 9) * 100}%, rgb(229, 231, 235) ${((formData.quality - 1) / 9) * 100}%, rgb(229, 231, 235) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="interruptions" className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Interruptions
                    </label>
                    <input
                      type="number"
                      id="interruptions"
                      value={formData.interruptions}
                      onChange={(e) => setFormData({ ...formData, interruptions: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min="0"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Felt Rested Upon Waking</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, felt_rested: !formData.felt_rested })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.felt_rested ? 'bg-teal-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.felt_rested ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows={3}
                      placeholder="Dreams, sleep environment, disturbances..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={saving}>
                      <Save className="inline h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="secondary" onClick={resetForm}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            ) : (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Entry History</h2>
                {history.length === 0 ? (
                  <EmptyState category="sleep" icon={<Moon className="h-8 w-8 text-gray-400" />} />
                ) : (
                  <div className="space-y-4">
                    {history.map((log) => {
                      const duration = log.duration_minutes
                        ? `${Math.floor(log.duration_minutes / 60)}h ${log.duration_minutes % 60}m`
                        : 'N/A';
                      return (
                        <div
                          key={log.id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatDateTime(log.sleep_start)} → {formatDateTime(log.sleep_end)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Duration: {duration}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(log)}
                                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(log.id)}
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="text-gray-500">Quality:</span>
                              <span className="ml-1 font-medium">{log.quality}/10</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Interruptions:</span>
                              <span className="ml-1 font-medium">{log.interruptions}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Rested:</span>
                              <span className="ml-1 font-medium">{log.felt_rested ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                          {log.notes && (
                            <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {log.notes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

```

## ./src/pages/StressLog.tsx

```
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Clock, Activity, Brain } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatDateTime, toLocalDateTimeString, getLocalDateTimeString } from '../utils/dateFormatters';
import SuccessToast from '../components/SuccessToast';
import EmptyState from '../components/EmptyState';
import { getSuccessMessage, getUpdateMessage, getDeleteMessage } from '../utils/copySystem';

interface StressLog {
  id?: string;
  logged_at: string;
  stress_level: number;
  triggers: string[];
  coping_methods: string[];
  physical_symptoms: string[];
  notes: string;
}

const commonTriggers = [
  'Work',
  'Relationships',
  'Finances',
  'Health',
  'Family',
  'Deadlines',
  'Social Events',
  'Traffic',
];

const commonCopingMethods = [
  'Deep Breathing',
  'Exercise',
  'Meditation',
  'Talk to Someone',
  'Music',
  'Walk',
  'Journaling',
  'Rest',
];

const commonPhysicalSymptoms = [
  'Headache',
  'Tension',
  'Rapid Heartbeat',
  'Fatigue',
  'Stomach Issues',
  'Sweating',
  'Muscle Pain',
  'Sleep Issues',
];

export default function StressLog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [error, setError] = useState('');
  const dismissToast = useCallback(() => setToastVisible(false), []);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<StressLog>({
    logged_at: getLocalDateTimeString(),
    stress_level: 5,
    triggers: [],
    coping_methods: [],
    physical_symptoms: [],
    notes: '',
  });

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('stress_logs')
      .select('*')
      .eq('user_id', user?.id)
      .order('logged_at', { ascending: false })
      .limit(50);

    if (data) {
      setHistory(data);
    }
  };

  const toggleItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const loggedAtTimestamp = new Date(formData.logged_at).toISOString();

      if (editingId) {
        const { error } = await supabase
          .from('stress_logs')
          .update({
            logged_at: loggedAtTimestamp,
            stress_level: formData.stress_level,
            triggers: formData.triggers,
            coping_methods: formData.coping_methods,
            physical_symptoms: formData.physical_symptoms,
            notes: formData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        setMessage(getUpdateMessage()); setToastVisible(true);
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('stress_logs')
          .insert({
            user_id: user?.id,
            logged_at: loggedAtTimestamp,
            stress_level: formData.stress_level,
            triggers: formData.triggers,
            coping_methods: formData.coping_methods,
            physical_symptoms: formData.physical_symptoms,
            notes: formData.notes,
          });

        if (error) throw error;
        setMessage(getSuccessMessage('stress')); setToastVisible(true);
      }

      resetForm();
      if (showHistory) {
        fetchHistory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      logged_at: getLocalDateTimeString(),
      stress_level: 5,
      triggers: [],
      coping_methods: [],
      physical_symptoms: [],
      notes: '',
    });
    setEditingId(null);
  };

  const handleEdit = (log: any) => {
    setFormData({
      logged_at: toLocalDateTimeString(log.logged_at),
      stress_level: log.stress_level,
      triggers: log.triggers || [],
      coping_methods: log.coping_methods || [],
      physical_symptoms: log.physical_symptoms || [],
      notes: log.notes || '',
    });
    setEditingId(log.id);
    setShowHistory(false);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const { error } = await supabase
      .from('stress_logs')
      .delete()
      .eq('id', id);

    if (error) {
      setError('Failed to delete entry');
    } else {
      setMessage(getDeleteMessage()); setToastVisible(true);
      fetchHistory();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Stress Log</h1>
              <p className="text-gray-600 mt-2">Track stress levels, triggers, and coping strategies</p>
            </div>

            <SuccessToast message={message} visible={toastVisible} onDismiss={dismissToast} />

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="mb-4 flex gap-3">
              <Button
                variant={!showHistory ? 'primary' : 'secondary'}
                onClick={() => setShowHistory(false)}
              >
                <Activity className="h-4 w-4 mr-2" />
                New Entry
              </Button>
              <Button
                variant={showHistory ? 'primary' : 'secondary'}
                onClick={() => setShowHistory(true)}
              >
                <Clock className="h-4 w-4 mr-2" />
                History
              </Button>
            </div>

            {!showHistory ? (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {editingId ? 'Edit Entry' : 'Log New Entry'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="logged_at" className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Time
                    </label>
                    <input
                      type="datetime-local"
                      id="logged_at"
                      value={formData.logged_at}
                      onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Brain className="inline h-4 w-4 mr-1" />
                      Stress Level: {formData.stress_level}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={formData.stress_level}
                      onChange={(e) => setFormData({ ...formData, stress_level: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      style={{
                        background: `linear-gradient(to right, rgb(249, 115, 22) 0%, rgb(249, 115, 22) ${((formData.stress_level - 1) / 9) * 100}%, rgb(229, 231, 235) ${((formData.stress_level - 1) / 9) * 100}%, rgb(229, 231, 235) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Calm</span>
                      <span>Overwhelmed</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Triggers (Optional)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {commonTriggers.map((trigger) => (
                        <button
                          key={trigger}
                          type="button"
                          onClick={() => setFormData({ ...formData, triggers: toggleItem(formData.triggers, trigger) })}
                          className={`p-3 rounded-lg border-2 transition-all text-sm ${
                            formData.triggers.includes(trigger)
                              ? 'border-red-500 bg-red-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {trigger}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Coping Methods Used (Optional)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {commonCopingMethods.map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setFormData({ ...formData, coping_methods: toggleItem(formData.coping_methods, method) })}
                          className={`p-3 rounded-lg border-2 transition-all text-sm ${
                            formData.coping_methods.includes(method)
                              ? 'border-teal-500 bg-teal-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Physical Symptoms (Optional)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {commonPhysicalSymptoms.map((symptom) => (
                        <button
                          key={symptom}
                          type="button"
                          onClick={() => setFormData({ ...formData, physical_symptoms: toggleItem(formData.physical_symptoms, symptom) })}
                          className={`p-3 rounded-lg border-2 transition-all text-sm ${
                            formData.physical_symptoms.includes(symptom)
                              ? 'border-orange-500 bg-orange-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {symptom}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows={3}
                      placeholder="Additional context or observations..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={saving}>
                      <Save className="inline h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="secondary" onClick={resetForm}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            ) : (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Entry History</h2>
                {history.length === 0 ? (
                  <EmptyState category="stress" icon={<Brain className="h-8 w-8 text-gray-400" />} />
                ) : (
                  <div className="space-y-4">
                    {history.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDateTime(log.logged_at)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Stress Level: {log.stress_level}/10
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(log)}
                              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {log.triggers && log.triggers.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-1">Triggers:</div>
                            <div className="flex flex-wrap gap-1">
                              {log.triggers.map((trigger: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800"
                                >
                                  {trigger}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {log.coping_methods && log.coping_methods.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-1">Coping Methods:</div>
                            <div className="flex flex-wrap gap-1">
                              {log.coping_methods.map((method: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800"
                                >
                                  {method}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {log.physical_symptoms && log.physical_symptoms.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-1">Physical Symptoms:</div>
                            <div className="flex flex-wrap gap-1">
                              {log.physical_symptoms.map((symptom: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800"
                                >
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {log.notes && (
                          <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {log.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

```

## ./src/pages/SymptomsLog.tsx

```
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Clock, Activity, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatDateTime, toLocalDateTimeString, getLocalDateTimeString } from '../utils/dateFormatters';
import SuccessToast from '../components/SuccessToast';
import EmptyState from '../components/EmptyState';
import { getSuccessMessage, getUpdateMessage, getDeleteMessage } from '../utils/copySystem';

interface SymptomLog {
  id?: string;
  logged_at: string;
  symptom_type: string;
  severity: number;
  duration_minutes: number;
  location: string;
  triggers: string[];
  notes: string;
}

const commonSymptoms = [
  'Abdominal Pain',
  'Bloating',
  'Nausea',
  'Cramping',
  'Gas',
  'Headache',
  'Fatigue',
  'Dizziness',
];

const commonTriggers = [
  'Food',
  'Stress',
  'Lack of Sleep',
  'Exercise',
  'Weather',
  'Medication',
  'Dehydration',
];

export default function SymptomsLog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [error, setError] = useState('');
  const dismissToast = useCallback(() => setToastVisible(false), []);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customSymptom, setCustomSymptom] = useState('');

  const [formData, setFormData] = useState<SymptomLog>({
    logged_at: getLocalDateTimeString(),
    symptom_type: '',
    severity: 5,
    duration_minutes: 30,
    location: '',
    triggers: [],
    notes: '',
  });

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', user?.id)
      .order('logged_at', { ascending: false })
      .limit(50);

    if (data) {
      setHistory(data);
    }
  };

  const toggleTrigger = (trigger: string) => {
    setFormData({
      ...formData,
      triggers: formData.triggers.includes(trigger)
        ? formData.triggers.filter((t) => t !== trigger)
        : [...formData.triggers, trigger],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const loggedAtTimestamp = new Date(formData.logged_at).toISOString();

      if (editingId) {
        const { error } = await supabase
          .from('symptom_logs')
          .update({
            logged_at: loggedAtTimestamp,
            symptom_type: formData.symptom_type,
            severity: formData.severity,
            duration_minutes: formData.duration_minutes,
            location: formData.location,
            triggers: formData.triggers,
            notes: formData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        setMessage(getUpdateMessage()); setToastVisible(true);
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('symptom_logs')
          .insert({
            user_id: user?.id,
            logged_at: loggedAtTimestamp,
            symptom_type: formData.symptom_type,
            severity: formData.severity,
            duration_minutes: formData.duration_minutes,
            location: formData.location,
            triggers: formData.triggers,
            notes: formData.notes,
          });

        if (error) throw error;
        setMessage(getSuccessMessage('symptoms')); setToastVisible(true);
      }

      resetForm();
      if (showHistory) {
        fetchHistory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      logged_at: getLocalDateTimeString(),
      symptom_type: '',
      severity: 5,
      duration_minutes: 30,
      location: '',
      triggers: [],
      notes: '',
    });
    setEditingId(null);
    setCustomSymptom('');
  };

  const handleEdit = (log: any) => {
    setFormData({
      logged_at: toLocalDateTimeString(log.logged_at),
      symptom_type: log.symptom_type,
      severity: log.severity,
      duration_minutes: log.duration_minutes || 30,
      location: log.location || '',
      triggers: log.triggers || [],
      notes: log.notes || '',
    });
    setEditingId(log.id);
    setShowHistory(false);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const { error } = await supabase
      .from('symptom_logs')
      .delete()
      .eq('id', id);

    if (error) {
      setError('Failed to delete entry');
    } else {
      setMessage(getDeleteMessage()); setToastVisible(true);
      fetchHistory();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Symptoms Log</h1>
              <p className="text-gray-600 mt-2">Track symptoms, severity, and potential triggers</p>
            </div>

            <SuccessToast message={message} visible={toastVisible} onDismiss={dismissToast} />

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="mb-4 flex gap-3">
              <Button
                variant={!showHistory ? 'primary' : 'secondary'}
                onClick={() => setShowHistory(false)}
              >
                <Activity className="h-4 w-4 mr-2" />
                New Entry
              </Button>
              <Button
                variant={showHistory ? 'primary' : 'secondary'}
                onClick={() => setShowHistory(true)}
              >
                <Clock className="h-4 w-4 mr-2" />
                History
              </Button>
            </div>

            {!showHistory ? (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {editingId ? 'Edit Entry' : 'Log New Entry'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="logged_at" className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Time
                    </label>
                    <input
                      type="datetime-local"
                      id="logged_at"
                      value={formData.logged_at}
                      onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Symptom Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      {commonSymptoms.map((symptom) => (
                        <button
                          key={symptom}
                          type="button"
                          onClick={() => setFormData({ ...formData, symptom_type: symptom })}
                          className={`p-3 rounded-lg border-2 transition-all text-sm ${
                            formData.symptom_type === symptom
                              ? 'border-teal-500 bg-teal-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {symptom}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSymptom}
                        onChange={(e) => setCustomSymptom(e.target.value)}
                        placeholder="Or enter custom symptom..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (customSymptom.trim()) {
                            setFormData({ ...formData, symptom_type: customSymptom.trim() });
                            setCustomSymptom('');
                          }
                        }}
                      >
                        Set
                      </Button>
                    </div>
                    {formData.symptom_type && (
                      <div className="mt-2 text-sm text-teal-600">
                        Selected: {formData.symptom_type}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity: {formData.severity}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                      style={{
                        background: `linear-gradient(to right, rgb(239, 68, 68) 0%, rgb(239, 68, 68) ${((formData.severity - 1) / 9) * 100}%, rgb(229, 231, 235) ${((formData.severity - 1) / 9) * 100}%, rgb(229, 231, 235) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Mild</span>
                      <span>Severe</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      id="duration"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Lower abdomen, Head, Chest..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Potential Triggers (Optional)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {commonTriggers.map((trigger) => (
                        <button
                          key={trigger}
                          type="button"
                          onClick={() => toggleTrigger(trigger)}
                          className={`p-3 rounded-lg border-2 transition-all text-sm ${
                            formData.triggers.includes(trigger)
                              ? 'border-orange-500 bg-orange-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {trigger}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows={3}
                      placeholder="Additional observations..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={saving || !formData.symptom_type}>
                      <Save className="inline h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="secondary" onClick={resetForm}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            ) : (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Entry History</h2>
                {history.length === 0 ? (
                  <EmptyState category="symptoms" icon={<AlertCircle className="h-8 w-8 text-gray-400" />} />
                ) : (
                  <div className="space-y-4">
                    {history.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDateTime(log.logged_at)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {log.symptom_type}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(log)}
                              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                          <div>
                            <span className="text-gray-500">Severity:</span>
                            <span className="ml-1 font-medium">{log.severity}/10</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Duration:</span>
                            <span className="ml-1 font-medium">{log.duration_minutes} min</span>
                          </div>
                        </div>
                        {log.location && (
                          <div className="mb-2 text-sm text-gray-600">
                            <span className="font-medium">Location:</span> {log.location}
                          </div>
                        )}
                        {log.triggers && log.triggers.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-1">Triggers:</div>
                            <div className="flex flex-wrap gap-1">
                              {log.triggers.map((trigger: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800"
                                >
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {trigger}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {log.notes && (
                          <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {log.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

```

## ./src/pages/Trends.tsx

```
import { useState } from 'react';
import { TrendingUp, Calendar, Download, Loader2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import { useTrendsData, TimeRange } from '../hooks/useTrendsData';
import BMFrequencyChart from '../components/trends/BMFrequencyChart';
import BristolDistributionChart from '../components/trends/BristolDistributionChart';
import SymptomIntensityChart from '../components/trends/SymptomIntensityChart';
import HydrationCorrelationChart from '../components/trends/HydrationCorrelationChart';
import SleepSymptomChart from '../components/trends/SleepSymptomChart';
import StressUrgencyChart from '../components/trends/StressUrgencyChart';

const timeRanges: TimeRange[] = [
  { days: 7, label: '7 Days' },
  { days: 14, label: '14 Days' },
  { days: 30, label: '30 Days' },
];

export default function Trends() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>(timeRanges[0]);
  const { data, loading, error } = useTrendsData(selectedRange);

  const handleExport = () => {
    if (!data) return;

    const exportData = {
      period: `${selectedRange.days} days`,
      exportedAt: new Date().toISOString(),
      data: data,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-trends-${selectedRange.days}days-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trends & Analytics</h1>
              <p className="text-gray-600">Visualize your health patterns over time</p>
            </div>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <Button
              onClick={handleExport}
              disabled={loading || !data}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <Download className="w-4 h-4" />
              Export Data
            </Button>
            <Button
              onClick={handlePrint}
              disabled={loading || !data}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Print Report
            </Button>
          </div>
        </div>

        <Card className="print:hidden">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Time Period:</span>
            </div>
            <div className="flex gap-2">
              {timeRanges.map((range) => (
                <button
                  key={range.days}
                  onClick={() => setSelectedRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedRange.days === range.days
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {loading && (
          <Card>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600">Loading analytics data...</span>
            </div>
          </Card>
        )}

        {error && (
          <Card>
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </Card>
        )}

        {data && !loading && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="print:break-inside-avoid">
                <BMFrequencyChart data={data.bmFrequency} />
              </Card>

              <Card className="print:break-inside-avoid">
                <BristolDistributionChart data={data.bristolDistribution} />
              </Card>
            </div>

            <Card className="print:break-inside-avoid">
              <SymptomIntensityChart data={data.symptomTrends} />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="print:break-inside-avoid">
                <HydrationCorrelationChart data={data.hydrationCorrelation} />
              </Card>

              <Card className="print:break-inside-avoid">
                <SleepSymptomChart data={data.sleepSymptomCorrelation} />
              </Card>
            </div>

            <Card className="print:break-inside-avoid">
              <StressUrgencyChart data={data.stressUrgencyCorrelation} />
            </Card>

            <Card className="bg-gradient-to-br from-blue-600 to-green-600 text-white print:break-inside-avoid">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Key Insights</h3>
                <div className="space-y-2 text-sm opacity-95">
                  <p>
                    Track your patterns consistently to identify correlations between lifestyle factors and digestive health.
                  </p>
                  <p>
                    Use this data to have informed conversations with your healthcare provider about your symptoms and triggers.
                  </p>
                  <p>
                    Remember: Individual results vary, and these visualizations are for informational purposes only.
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
        </div>
      </main>
    </div>
  );
}

```

## ./src/types/domain.ts

```
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface BMAnalytics {
  totalCount: number;
  averagePerDay: number;
  averagePerWeek: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

export interface BristolDistribution {
  type: number;
  count: number;
  percentage: number;
}

export interface SymptomTrend {
  date: string;
  symptomType: string;
  avgSeverity: number;
  count?: number;
}

export interface HealthMarkerCorrelation {
  date: string;
  sleepQuality: number | null;
  stressLevel: number | null;
  symptomSeverity: number | null;
  bmCount: number;
}

export interface TriggerPattern {
  trigger: string;
  category: string;
  occurrences: number;
  avgSymptomSeverity: number;
  correlationStrength: number;
}

export interface MedicationCorrelation {
  date: string;
  medicationName: string;
  dosage: string;
  timeTaken: string;
  symptomSeverityBefore: number | null;
  symptomSeverityAfter: number | null;
}

export interface ClinicalAlert {
  type: 'high_frequency' | 'blood_present' | 'severe_pain' | 'weight_loss' | 'concerning_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: string;
  affectedDates: string[];
}

```

## ./src/utils/calorieEstimator.ts

```
interface FoodItem {
  name: string;
  caloriesPer100g?: number;
  defaultPortionSize?: number;
  defaultPortionName?: string;
}

const commonFoods: Record<string, FoodItem> = {
  apple: {
    name: 'apple',
    caloriesPer100g: 52,
    defaultPortionSize: 182,
    defaultPortionName: 'medium apple',
  },
  banana: {
    name: 'banana',
    caloriesPer100g: 89,
    defaultPortionSize: 118,
    defaultPortionName: 'medium banana',
  },
  orange: {
    name: 'orange',
    caloriesPer100g: 47,
    defaultPortionSize: 154,
    defaultPortionName: 'medium orange',
  },
  carrot: {
    name: 'carrot',
    caloriesPer100g: 41,
    defaultPortionSize: 61,
    defaultPortionName: 'medium carrot',
  },
  broccoli: {
    name: 'broccoli',
    caloriesPer100g: 34,
    defaultPortionSize: 91,
    defaultPortionName: 'cup broccoli',
  },
  spinach: {
    name: 'spinach',
    caloriesPer100g: 23,
    defaultPortionSize: 30,
    defaultPortionName: 'cup spinach',
  },
  chicken: {
    name: 'chicken breast',
    caloriesPer100g: 165,
    defaultPortionSize: 100,
    defaultPortionName: '100g chicken breast',
  },
  beef: {
    name: 'beef',
    caloriesPer100g: 250,
    defaultPortionSize: 100,
    defaultPortionName: '100g beef',
  },
  fish: {
    name: 'fish',
    caloriesPer100g: 82,
    defaultPortionSize: 100,
    defaultPortionName: '100g fish',
  },
  salmon: {
    name: 'salmon',
    caloriesPer100g: 208,
    defaultPortionSize: 100,
    defaultPortionName: '100g salmon',
  },
  egg: {
    name: 'egg',
    caloriesPer100g: 155,
    defaultPortionSize: 50,
    defaultPortionName: 'large egg',
  },
  bread: {
    name: 'bread',
    caloriesPer100g: 265,
    defaultPortionSize: 32,
    defaultPortionName: 'slice of bread',
  },
  rice: {
    name: 'rice',
    caloriesPer100g: 130,
    defaultPortionSize: 150,
    defaultPortionName: 'cup cooked rice',
  },
  pasta: {
    name: 'pasta',
    caloriesPer100g: 131,
    defaultPortionSize: 150,
    defaultPortionName: 'cup cooked pasta',
  },
  pizza: {
    name: 'pizza',
    caloriesPer100g: 285,
    defaultPortionSize: 100,
    defaultPortionName: 'slice of pizza',
  },
  cheese: {
    name: 'cheese',
    caloriesPer100g: 402,
    defaultPortionSize: 28,
    defaultPortionName: '1 oz cheese',
  },
  milk: {
    name: 'milk',
    caloriesPer100g: 61,
    defaultPortionSize: 240,
    defaultPortionName: 'cup milk',
  },
  yogurt: {
    name: 'yogurt',
    caloriesPer100g: 59,
    defaultPortionSize: 200,
    defaultPortionName: 'cup yogurt',
  },
  peanut: {
    name: 'peanuts',
    caloriesPer100g: 567,
    defaultPortionSize: 28,
    defaultPortionName: '1 oz peanuts',
  },
  almonds: {
    name: 'almonds',
    caloriesPer100g: 579,
    defaultPortionSize: 28,
    defaultPortionName: '1 oz almonds',
  },
  butter: {
    name: 'butter',
    caloriesPer100g: 717,
    defaultPortionSize: 14,
    defaultPortionName: '1 tablespoon butter',
  },
  oil: {
    name: 'oil',
    caloriesPer100g: 884,
    defaultPortionSize: 14,
    defaultPortionName: '1 tablespoon oil',
  },
  chocolate: {
    name: 'chocolate',
    caloriesPer100g: 546,
    defaultPortionSize: 100,
    defaultPortionName: '100g chocolate',
  },
  potato: {
    name: 'potato',
    caloriesPer100g: 77,
    defaultPortionSize: 300,
    defaultPortionName: 'medium potato',
  },
  tomato: {
    name: 'tomato',
    caloriesPer100g: 18,
    defaultPortionSize: 123,
    defaultPortionName: 'medium tomato',
  },
  lettuce: {
    name: 'lettuce',
    caloriesPer100g: 15,
    defaultPortionSize: 47,
    defaultPortionName: 'cup lettuce',
  },
};

const quantityMultipliers: Record<string, number> = {
  small: 0.75,
  medium: 1,
  large: 1.5,
  extra: 2,
  double: 2,
  single: 1,
  half: 0.5,
};

function extractQuantity(input: string): { quantity: number; foodPart: string } {
  const trimmed = input.trim().toLowerCase();

  const numberMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*/);
  if (numberMatch) {
    return {
      quantity: parseFloat(numberMatch[1]),
      foodPart: trimmed.slice(numberMatch[0].length),
    };
  }

  const quantityMatch = trimmed.match(
    /^(small|medium|large|extra|double|single|half)\s+/
  );
  if (quantityMatch) {
    return {
      quantity: quantityMultipliers[quantityMatch[1]],
      foodPart: trimmed.slice(quantityMatch[0].length),
    };
  }

  return {
    quantity: 1,
    foodPart: trimmed,
  };
}

function findFoodMatch(foodInput: string): FoodItem | null {
  const normalized = foodInput.toLowerCase().trim();

  if (commonFoods[normalized]) {
    return commonFoods[normalized];
  }

  for (const [key, food] of Object.entries(commonFoods)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return food;
    }
  }

  return null;
}

export function estimateCalories(input: string): {
  calories: number;
  foodName: string;
  found: boolean;
} {
  if (!input || input.trim().length === 0) {
    return { calories: 0, foodName: '', found: false };
  }

  const { quantity, foodPart } = extractQuantity(input);
  const food = findFoodMatch(foodPart);

  if (!food) {
    return {
      calories: 0,
      foodName: input,
      found: false,
    };
  }

  const portionSize = food.defaultPortionSize || 100;
  const caloriesPer100g = food.caloriesPer100g || 0;
  const portionCalories = (caloriesPer100g * portionSize) / 100;
  const totalCalories = Math.round(portionCalories * quantity);

  return {
    calories: totalCalories,
    foodName: food.name,
    found: true,
  };
}

export function estimateCaloriesForMultipleFoods(items: string[]): {
  totalCalories: number;
  itemBreakdown: Array<{
    item: string;
    calories: number;
    found: boolean;
  }>;
} {
  const breakdown = items.map((item) => {
    const estimate = estimateCalories(item);
    return {
      item: estimate.foodName || item,
      calories: estimate.calories,
      found: estimate.found,
    };
  });

  const totalCalories = breakdown.reduce((sum, item) => sum + item.calories, 0);

  return {
    totalCalories,
    itemBreakdown: breakdown,
  };
}

```

## ./src/utils/clinicalReportQueries.ts

```
import { supabase } from '../lib/supabase';
import type {
  DateRange,
  BMAnalytics,
  BristolDistribution,
  SymptomTrend,
  HealthMarkerCorrelation,
  TriggerPattern,
  MedicationCorrelation,
  ClinicalAlert,
} from '../types/domain';

export type { DateRange, BMAnalytics, BristolDistribution, SymptomTrend, HealthMarkerCorrelation, TriggerPattern, MedicationCorrelation, ClinicalAlert };

export async function fetchBMAnalytics(userId: string, dateRange: DateRange): Promise<BMAnalytics> {
  const { data, error } = await supabase
    .from('bm_logs')
    .select('id, logged_at')
    .eq('user_id', userId)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate)
    .order('logged_at');

  if (error) throw error;

  const totalCount = data?.length || 0;
  const daysDiff = Math.max(1, Math.ceil(
    (new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1);

  const averagePerDay = totalCount / daysDiff;
  const averagePerWeek = averagePerDay * 7;

  const standardError = Math.sqrt(averagePerDay) / Math.sqrt(daysDiff);
  const confidenceInterval = {
    lower: Math.max(0, averagePerDay - 1.96 * standardError),
    upper: averagePerDay + 1.96 * standardError,
  };

  return {
    totalCount,
    averagePerDay,
    averagePerWeek,
    confidenceInterval,
  };
}

export async function fetchBristolDistribution(userId: string, dateRange: DateRange): Promise<BristolDistribution[]> {
  const { data, error } = await supabase
    .from('bm_logs')
    .select('bristol_type')
    .eq('user_id', userId)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate)
    .not('bristol_type', 'is', null);

  if (error) throw error;

  const total = data?.length || 0;
  const distribution: { [key: number]: number } = {};

  data?.forEach(log => {
    const type = log.bristol_type;
    distribution[type] = (distribution[type] || 0) + 1;
  });

  return Object.entries(distribution).map(([type, count]) => ({
    type: parseInt(type),
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  })).sort((a, b) => a.type - b.type);
}

export async function fetchSymptomTrends(userId: string, dateRange: DateRange): Promise<SymptomTrend[]> {
  const { data, error } = await supabase
    .from('symptoms_logs')
    .select('logged_at, symptom_type, severity')
    .eq('user_id', userId)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate)
    .order('logged_at');

  if (error) throw error;

  const trendMap: { [key: string]: { totalSeverity: number; count: number } } = {};

  data?.forEach(log => {
    const dateKey = log.logged_at.split('T')[0];
    const key = `${dateKey}-${log.symptom_type}`;

    if (!trendMap[key]) {
      trendMap[key] = { totalSeverity: 0, count: 0 };
    }
    trendMap[key].totalSeverity += log.severity;
    trendMap[key].count += 1;
  });

  return Object.entries(trendMap).map(([key, value]) => {
    const [date, symptomType] = key.split('-', 2);
    return {
      date,
      symptomType,
      avgSeverity: value.totalSeverity / value.count,
      count: value.count,
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchHealthMarkerCorrelation(userId: string, dateRange: DateRange): Promise<HealthMarkerCorrelation[]> {
  const [sleepData, stressData, symptomData, bmData] = await Promise.all([
    supabase.from('sleep_logs').select('logged_at, quality_rating').eq('user_id', userId)
      .gte('logged_at', dateRange.startDate).lte('logged_at', dateRange.endDate),
    supabase.from('stress_logs').select('logged_at, stress_level').eq('user_id', userId)
      .gte('logged_at', dateRange.startDate).lte('logged_at', dateRange.endDate),
    supabase.from('symptoms_logs').select('logged_at, severity').eq('user_id', userId)
      .gte('logged_at', dateRange.startDate).lte('logged_at', dateRange.endDate),
    supabase.from('bm_logs').select('logged_at').eq('user_id', userId)
      .gte('logged_at', dateRange.startDate).lte('logged_at', dateRange.endDate),
  ]);

  const dateMap: { [date: string]: HealthMarkerCorrelation } = {};

  const initDate = (date: string) => {
    if (!dateMap[date]) {
      dateMap[date] = {
        date,
        sleepQuality: null,
        stressLevel: null,
        symptomSeverity: null,
        bmCount: 0,
      };
    }
  };

  sleepData.data?.forEach(log => {
    const date = log.logged_at.split('T')[0];
    initDate(date);
    dateMap[date].sleepQuality = log.quality_rating;
  });

  stressData.data?.forEach(log => {
    const date = log.logged_at.split('T')[0];
    initDate(date);
    dateMap[date].stressLevel = log.stress_level;
  });

  symptomData.data?.forEach(log => {
    const date = log.logged_at.split('T')[0];
    initDate(date);
    if (dateMap[date].symptomSeverity === null) {
      dateMap[date].symptomSeverity = log.severity;
    } else {
      dateMap[date].symptomSeverity = Math.max(dateMap[date].symptomSeverity!, log.severity);
    }
  });

  bmData.data?.forEach(log => {
    const date = log.logged_at.split('T')[0];
    initDate(date);
    dateMap[date].bmCount += 1;
  });

  return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchTriggerPatterns(userId: string, dateRange: DateRange): Promise<TriggerPattern[]> {
  const { data: foodData, error: foodError } = await supabase
    .from('food_logs')
    .select('logged_at, food_item')
    .eq('user_id', userId)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate);

  if (foodError) throw foodError;

  const { data: symptomData, error: symptomError } = await supabase
    .from('symptoms_logs')
    .select('logged_at, severity')
    .eq('user_id', userId)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate);

  if (symptomError) throw symptomError;

  const triggerMap: { [food: string]: { occurrences: number; totalSeverity: number; severityCount: number } } = {};

  foodData?.forEach(foodLog => {
    const foodDate = new Date(foodLog.logged_at);
    const foodItem = foodLog.food_item;

    if (!triggerMap[foodItem]) {
      triggerMap[foodItem] = { occurrences: 0, totalSeverity: 0, severityCount: 0 };
    }
    triggerMap[foodItem].occurrences += 1;

    const relatedSymptoms = symptomData?.filter(symptom => {
      const symptomDate = new Date(symptom.logged_at);
      const timeDiff = symptomDate.getTime() - foodDate.getTime();
      return timeDiff >= 0 && timeDiff <= 8 * 60 * 60 * 1000;
    });

    relatedSymptoms?.forEach(symptom => {
      triggerMap[foodItem].totalSeverity += symptom.severity;
      triggerMap[foodItem].severityCount += 1;
    });
  });

  return Object.entries(triggerMap)
    .map(([food, data]) => ({
      trigger: food,
      category: 'dietary',
      occurrences: data.occurrences,
      avgSymptomSeverity: data.severityCount > 0 ? data.totalSeverity / data.severityCount : 0,
      correlationStrength: data.severityCount / data.occurrences,
    }))
    .filter(trigger => trigger.correlationStrength > 0.3)
    .sort((a, b) => b.correlationStrength - a.correlationStrength)
    .slice(0, 10);
}

export async function fetchMedicationCorrelation(userId: string, dateRange: DateRange): Promise<MedicationCorrelation[]> {
  const { data: medData, error: medError } = await supabase
    .from('medication_logs')
    .select('logged_at, medication_name, dosage')
    .eq('user_id', userId)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate)
    .order('logged_at');

  if (medError) throw medError;

  const { data: symptomData, error: symptomError } = await supabase
    .from('symptoms_logs')
    .select('logged_at, severity')
    .eq('user_id', userId)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate);

  if (symptomError) throw symptomError;

  return medData?.map(med => {
    const medTime = new Date(med.logged_at);
    const date = med.logged_at.split('T')[0];
    const timeTaken = medTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const symptomsBefore = symptomData?.filter(s => {
      const sTime = new Date(s.logged_at);
      const diff = medTime.getTime() - sTime.getTime();
      return diff >= 0 && diff <= 2 * 60 * 60 * 1000;
    });

    const symptomsAfter = symptomData?.filter(s => {
      const sTime = new Date(s.logged_at);
      const diff = sTime.getTime() - medTime.getTime();
      return diff >= 0 && diff <= 4 * 60 * 60 * 1000;
    });

    const avgBefore = symptomsBefore && symptomsBefore.length > 0
      ? symptomsBefore.reduce((sum, s) => sum + s.severity, 0) / symptomsBefore.length
      : null;

    const avgAfter = symptomsAfter && symptomsAfter.length > 0
      ? symptomsAfter.reduce((sum, s) => sum + s.severity, 0) / symptomsAfter.length
      : null;

    return {
      date,
      medicationName: med.medication_name,
      dosage: med.dosage,
      timeTaken,
      symptomSeverityBefore: avgBefore,
      symptomSeverityAfter: avgAfter,
    };
  }) || [];
}

export async function generateClinicalAlerts(userId: string, dateRange: DateRange): Promise<ClinicalAlert[]> {
  const alerts: ClinicalAlert[] = [];

  const bmAnalytics = await fetchBMAnalytics(userId, dateRange);
  if (bmAnalytics.averagePerDay > 6) {
    alerts.push({
      type: 'high_frequency',
      severity: 'high',
      message: 'Elevated bowel movement frequency detected',
      details: `Average of ${bmAnalytics.averagePerDay.toFixed(1)} bowel movements per day exceeds normal range (1-3 per day). May indicate acute gastroenteritis, inflammatory bowel disease, or malabsorption.`,
      affectedDates: [dateRange.startDate, dateRange.endDate],
    });
  }

  const { data: bloodData, error: bloodError } = await supabase
    .from('bm_logs')
    .select('logged_at, blood_present')
    .eq('user_id', userId)
    .eq('blood_present', true)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate);

  if (!bloodError && bloodData && bloodData.length > 0) {
    alerts.push({
      type: 'blood_present',
      severity: 'critical',
      message: 'Hematochezia documented',
      details: `Blood presence noted in ${bloodData.length} instance(s). Requires immediate clinical evaluation to rule out lower GI bleeding, hemorrhoids, inflammatory bowel disease, or colorectal pathology.`,
      affectedDates: bloodData.map(log => log.logged_at.split('T')[0]),
    });
  }

  const { data: severeSymptoms, error: symptomError } = await supabase
    .from('symptoms_logs')
    .select('logged_at, symptom_type, severity')
    .eq('user_id', userId)
    .gte('severity', 8)
    .gte('logged_at', dateRange.startDate)
    .lte('logged_at', dateRange.endDate);

  if (!symptomError && severeSymptoms && severeSymptoms.length > 0) {
    const painEpisodes = severeSymptoms.filter(s => s.symptom_type === 'Abdominal Pain');
    if (painEpisodes.length > 0) {
      alerts.push({
        type: 'severe_pain',
        severity: 'high',
        message: 'Severe abdominal pain episodes recorded',
        details: `${painEpisodes.length} episode(s) of severe abdominal pain (severity ≥8/10). Differential diagnosis includes acute abdomen, bowel obstruction, perforation, or severe inflammatory process.`,
        affectedDates: painEpisodes.map(log => log.logged_at.split('T')[0]),
      });
    }
  }

  const bristolDistribution = await fetchBristolDistribution(userId, dateRange);
  const extremeTypes = bristolDistribution.filter(d => d.type === 1 || d.type === 7);
  const extremePercentage = extremeTypes.reduce((sum, d) => sum + d.percentage, 0);

  if (extremePercentage > 40) {
    alerts.push({
      type: 'concerning_pattern',
      severity: 'medium',
      message: 'Persistent stool consistency abnormalities',
      details: `${extremePercentage.toFixed(1)}% of bowel movements classified as Bristol Type 1 (severe constipation) or Type 7 (severe diarrhea). Indicates significant GI motility dysfunction requiring therapeutic intervention.`,
      affectedDates: [dateRange.startDate, dateRange.endDate],
    });
  }

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

```

## ./src/utils/copySystem.ts

```
const successMessages: Record<string, string[]> = {
  bm: [
    'Logged and noted.',
    'Another data point for your health story.',
    'Your gut thanks you for the update.',
    'Noted. Your future self will appreciate this.',
    'One more entry in the books.',
  ],
  food: [
    'Meal logged. Bon appetit!',
    'Got it. Your food diary is looking thorough.',
    'Tracked. Every bite tells a story.',
    'Noted. Good records make great insights.',
    'Logged. Your nutrition timeline just grew.',
  ],
  hydration: [
    'Sip recorded. Keep it flowing.',
    'Hydration logged. Your cells approve.',
    'Got it. Every drop counts toward your goal.',
    'Tracked. Staying hydrated is an underrated skill.',
    'Logged. Water intake game: strong.',
  ],
  symptoms: [
    'Symptom logged. Knowledge is power.',
    'Recorded. Tracking patterns helps find answers.',
    'Noted. This data helps connect the dots.',
    'Logged. The more you track, the clearer the picture.',
    'Got it. Your health timeline is building.',
  ],
  sleep: [
    'Sleep data logged. Rest well, track better.',
    'Recorded. Quality sleep is quality data.',
    'Got it. Your sleep patterns are taking shape.',
    'Noted. Sweet dreams, solid data.',
    'Logged. Sleep tracking is self-care.',
  ],
  stress: [
    'Stress level captured.',
    'Recorded. Awareness is the first step.',
    'Noted. Tracking stress helps manage it.',
    'Got it. Your body-mind connection is documented.',
    'Logged. You are more than your stress levels.',
  ],
  medication: [
    'Medication logged. Consistency matters.',
    'Got it. Adherence tracked.',
    'Noted. Your medication timeline is up to date.',
    'Logged. Staying on top of your regimen.',
    'Tracked. One less thing to remember.',
  ],
  generic: [
    'Saved successfully.',
    'Entry recorded.',
    'All set.',
    'Done. Looking good.',
    'Captured and stored safely.',
  ],
};

const updateMessages = [
  'Entry updated.',
  'Changes saved.',
  'Updated successfully.',
  'All changes recorded.',
  'Edits saved.',
];

const deleteMessages = [
  'Entry removed.',
  'Deleted successfully.',
  'Gone. Like it was never there.',
  'Removed from your records.',
  'Entry cleared.',
];

const emptyStateMessages: Record<string, { title: string; subtitle: string; hint: string }> = {
  bm: {
    title: 'No entries yet',
    subtitle: 'Your bowel movement log is a blank page, ready for its first chapter.',
    hint: 'Tap "New Entry" above to start building your health record.',
  },
  food: {
    title: 'No meals tracked yet',
    subtitle: 'Your food diary is waiting for its first review.',
    hint: 'Log a meal to start spotting dietary patterns.',
  },
  hydration: {
    title: 'No drinks logged yet',
    subtitle: 'Your hydration timeline is thirsty for data.',
    hint: 'Log your first beverage to start tracking your daily intake.',
  },
  symptoms: {
    title: 'No symptoms recorded',
    subtitle: 'A clean slate. Here is hoping it stays that way.',
    hint: 'If something comes up, log it here to help identify patterns.',
  },
  sleep: {
    title: 'No sleep data yet',
    subtitle: 'Your sleep log is well-rested and waiting.',
    hint: 'Track your first night to start understanding your sleep patterns.',
  },
  stress: {
    title: 'No stress entries',
    subtitle: 'Your stress tracker has nothing to worry about. Yet.',
    hint: 'Log how you are feeling to build awareness over time.',
  },
  medication: {
    title: 'No medications logged',
    subtitle: 'Your medication tracker is standing by.',
    hint: 'Add medications to monitor your adherence and timing.',
  },
  insights: {
    title: 'Your Insights Are Brewing',
    subtitle: 'We need a few days of data to find meaningful patterns. The more you log, the smarter your insights become.',
    hint: 'Try logging across different categories -- meals, symptoms, sleep -- for the richest analysis.',
  },
};

const streakCelebrations: Record<number, string> = {
  3: 'Three days running. You are finding your rhythm.',
  7: 'A full week of tracking. That is real commitment.',
  14: 'Two weeks strong. Your data is starting to tell a story.',
  21: 'Twenty-one days. They say that is how habits form.',
  30: 'One month of consistent tracking. That is impressive dedication.',
  60: 'Two months in. You are a data-driven health champion.',
  90: 'Ninety days. Your health profile is incredibly rich now.',
  100: 'Triple digits. You and GutWise are an unstoppable team.',
  365: 'One full year. Your longitudinal data is genuinely valuable.',
};

const greetings = {
  morning: ['Good morning', 'Rise and shine', 'Morning'],
  afternoon: ['Good afternoon', 'Afternoon', 'Hope your day is going well'],
  evening: ['Good evening', 'Evening', 'Winding down'],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getSuccessMessage(category: string = 'generic'): string {
  return pickRandom(successMessages[category] || successMessages.generic);
}

export function getUpdateMessage(): string {
  return pickRandom(updateMessages);
}

export function getDeleteMessage(): string {
  return pickRandom(deleteMessages);
}

export function getEmptyStateMessage(category: string) {
  return emptyStateMessages[category] || emptyStateMessages.insights;
}

export function getStreakCelebration(days: number): string | null {
  if (streakCelebrations[days]) return streakCelebrations[days];
  const milestones = Object.keys(streakCelebrations).map(Number).sort((a, b) => a - b);
  for (let i = milestones.length - 1; i >= 0; i--) {
    if (days >= milestones[i]) return streakCelebrations[milestones[i]];
  }
  return null;
}

export function getGreeting(): { text: string; period: 'morning' | 'afternoon' | 'evening' } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: pickRandom(greetings.morning), period: 'morning' };
  if (hour < 18) return { text: pickRandom(greetings.afternoon), period: 'afternoon' };
  return { text: pickRandom(greetings.evening), period: 'evening' };
}

```

## ./src/utils/dateFormatters.ts

```
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, '0');

  return `${month}/${day}/${year}, ${hoursStr}:${minutes}:${seconds} ${ampm}`;
};

export const toLocalDateTimeString = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, '0');

  return `${hoursStr}:${minutes}:${seconds} ${ampm}`;
};

export const getLocalDateTimeString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const getDateOnly = (dateStr: string): string => {
  return dateStr.split('T')[0];
};

export const getLocalDateTimeStringWithOffset = (hoursOffset: number = 0): string => {
  const now = new Date();
  now.setHours(now.getHours() + hoursOffset);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

```

## ./src/utils/insightEngine.ts

```
import { supabase } from '../lib/supabase';

export interface InsightEvidence {
  dates?: string[];
  frequency?: string;
  correlation?: string;
  examples?: string[];
  statistics?: Record<string, any>;
}

export interface Insight {
  id: string;
  user_id: string;
  insight_type: 'sleep_symptom' | 'stress_urgency' | 'hydration_consistency' | 'food_symptom' | 'temporal_pattern';
  summary: string;
  evidence: InsightEvidence;
  confidence_level: 'low' | 'medium' | 'high';
  occurrence_count: number;
  first_detected_at: string;
  last_detected_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SleepLog {
  logged_at: string;
  quality_rating: number;
  duration_hours: number;
}

interface SymptomLog {
  logged_at: string;
  symptom_type: string;
  severity: number;
}

interface StressLog {
  logged_at: string;
  level: number;
}

interface BMLog {
  logged_at: string;
  urgency_level?: number;
  had_cramping?: boolean;
}

interface HydrationLog {
  logged_at: string;
  water_intake_ml: number;
  urine_color?: string;
}

interface FoodLog {
  logged_at: string;
  food_name: string;
  tags?: string[];
}

const DISCLAIMER = "This insight is for tracking purposes only and is not medical advice. Consult healthcare providers for persistent concerns.";

function getDateOnly(dateStr: string): string {
  return dateStr.split('T')[0];
}

function addHours(dateStr: string, hours: number): Date {
  const date = new Date(dateStr);
  date.setHours(date.getHours() + hours);
  return date;
}

function isWithinTimeWindow(targetDate: string, referenceDate: string, minHours: number, maxHours: number): boolean {
  const target = new Date(targetDate);
  const minTime = addHours(referenceDate, minHours);
  const maxTime = addHours(referenceDate, maxHours);
  return target >= minTime && target <= maxTime;
}

export async function analyzeSleepSymptomCorrelation(userId: string): Promise<Insight | null> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: sleepLogs } = await supabase
    .from('sleep_logs')
    .select('logged_at, quality_rating, duration_hours')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  const { data: symptomLogs } = await supabase
    .from('symptoms_log')
    .select('logged_at, symptom_type, severity')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  if (!sleepLogs || sleepLogs.length < 3 || !symptomLogs || symptomLogs.length < 3) {
    return null;
  }

  const poorSleepNights = sleepLogs.filter(
    (log: SleepLog) => log.quality_rating < 6 || log.duration_hours < 6
  );

  if (poorSleepNights.length < 2) {
    return null;
  }

  let correlationCount = 0;
  const evidenceDates: string[] = [];
  const symptomTypes: Record<string, number> = {};

  poorSleepNights.forEach((sleepLog: SleepLog) => {
    const followingSymptoms = symptomLogs.filter((symptom: SymptomLog) =>
      isWithinTimeWindow(symptom.logged_at, sleepLog.logged_at, 24, 48) && symptom.severity >= 6
    );

    if (followingSymptoms.length > 0) {
      correlationCount++;
      evidenceDates.push(getDateOnly(sleepLog.logged_at));
      followingSymptoms.forEach((s: SymptomLog) => {
        symptomTypes[s.symptom_type] = (symptomTypes[s.symptom_type] || 0) + 1;
      });
    }
  });

  if (correlationCount < 2) {
    return null;
  }

  const rate = (correlationCount / poorSleepNights.length) * 100;
  const topSymptom = Object.entries(symptomTypes).sort((a, b) => b[1] - a[1])[0];

  let confidenceLevel: 'low' | 'medium' | 'high';
  if (correlationCount >= 7) confidenceLevel = 'high';
  else if (correlationCount >= 4) confidenceLevel = 'medium';
  else confidenceLevel = 'low';

  const summary = `You tend to experience increased ${topSymptom[0]} on days following poor sleep. ${DISCLAIMER}`;

  const evidence: InsightEvidence = {
    frequency: `${correlationCount} out of ${poorSleepNights.length} nights with poor sleep were followed by symptoms`,
    correlation: `${rate.toFixed(0)}% correlation rate`,
    dates: evidenceDates,
    statistics: { symptomTypes, totalPoorSleepNights: poorSleepNights.length }
  };

  return {
    id: '',
    user_id: userId,
    insight_type: 'sleep_symptom',
    summary,
    evidence,
    confidence_level: confidenceLevel,
    occurrence_count: correlationCount,
    first_detected_at: poorSleepNights[0].logged_at,
    last_detected_at: poorSleepNights[poorSleepNights.length - 1].logged_at,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export async function analyzeStressUrgencyPattern(userId: string): Promise<Insight | null> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: stressLogs } = await supabase
    .from('stress_logs')
    .select('logged_at, level')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  const { data: bmLogs } = await supabase
    .from('bm_logs')
    .select('logged_at, urgency_level, had_cramping')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  if (!stressLogs || stressLogs.length < 3 || !bmLogs || bmLogs.length < 3) {
    return null;
  }

  const highStressEvents = stressLogs.filter((log: StressLog) => log.level >= 7);

  if (highStressEvents.length < 2) {
    return null;
  }

  let correlationCount = 0;
  const evidenceDates: string[] = [];
  let urgencyCount = 0;
  let crampingCount = 0;

  highStressEvents.forEach((stressLog: StressLog) => {
    const followingBMs = bmLogs.filter((bm: BMLog) =>
      isWithinTimeWindow(bm.logged_at, stressLog.logged_at, 2, 6)
    );

    const hasUrgency = followingBMs.some((bm: BMLog) => (bm.urgency_level || 0) >= 4);
    const hasCramping = followingBMs.some((bm: BMLog) => bm.had_cramping);

    if (hasUrgency || hasCramping) {
      correlationCount++;
      evidenceDates.push(getDateOnly(stressLog.logged_at));
      if (hasUrgency) urgencyCount++;
      if (hasCramping) crampingCount++;
    }
  });

  if (correlationCount < 2) {
    return null;
  }

  const rate = (correlationCount / highStressEvents.length) * 100;

  let confidenceLevel: 'low' | 'medium' | 'high';
  if (correlationCount >= 7) confidenceLevel = 'high';
  else if (correlationCount >= 4) confidenceLevel = 'medium';
  else confidenceLevel = 'low';

  const symptoms = [];
  if (urgencyCount > 0) symptoms.push('urgency');
  if (crampingCount > 0) symptoms.push('cramping');

  const summary = `High stress levels appear linked to ${symptoms.join(' and ')} episodes within 2-6 hours. ${DISCLAIMER}`;

  const evidence: InsightEvidence = {
    frequency: `${correlationCount} out of ${highStressEvents.length} high-stress periods were followed by symptoms`,
    correlation: `${rate.toFixed(0)}% correlation rate`,
    dates: evidenceDates,
    statistics: { urgencyCount, crampingCount, totalHighStressEvents: highStressEvents.length }
  };

  return {
    id: '',
    user_id: userId,
    insight_type: 'stress_urgency',
    summary,
    evidence,
    confidence_level: confidenceLevel,
    occurrence_count: correlationCount,
    first_detected_at: highStressEvents[0].logged_at,
    last_detected_at: highStressEvents[highStressEvents.length - 1].logged_at,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export async function analyzeHydrationConsistencyPattern(userId: string): Promise<Insight | null> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: hydrationLogs } = await supabase
    .from('hydration_logs')
    .select('logged_at, water_intake_ml, urine_color')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  const { data: bmLogs } = await supabase
    .from('bm_logs')
    .select('logged_at, bristol_scale')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  if (!hydrationLogs || hydrationLogs.length < 3 || !bmLogs || bmLogs.length < 3) {
    return null;
  }

  const lowHydrationDays = hydrationLogs.filter(
    (log: HydrationLog) => log.water_intake_ml < 1500 || (log.urine_color && !['pale_yellow', 'light_yellow'].includes(log.urine_color))
  );

  if (lowHydrationDays.length < 2) {
    return null;
  }

  let correlationCount = 0;
  const evidenceDates: string[] = [];

  lowHydrationDays.forEach((hydrationLog: HydrationLog) => {
    const followingBMs = bmLogs.filter((bm: any) =>
      isWithinTimeWindow(bm.logged_at, hydrationLog.logged_at, 12, 24) && bm.bristol_scale <= 2
    );

    if (followingBMs.length > 0) {
      correlationCount++;
      evidenceDates.push(getDateOnly(hydrationLog.logged_at));
    }
  });

  if (correlationCount < 2) {
    return null;
  }

  const rate = (correlationCount / lowHydrationDays.length) * 100;

  let confidenceLevel: 'low' | 'medium' | 'high';
  if (correlationCount >= 7) confidenceLevel = 'high';
  else if (correlationCount >= 4) confidenceLevel = 'medium';
  else confidenceLevel = 'low';

  const summary = `Low hydration days appear correlated with harder stool consistency within 12-24 hours. ${DISCLAIMER}`;

  const evidence: InsightEvidence = {
    frequency: `${correlationCount} out of ${lowHydrationDays.length} low-hydration days were followed by harder stools`,
    correlation: `${rate.toFixed(0)}% correlation rate`,
    dates: evidenceDates,
    statistics: { totalLowHydrationDays: lowHydrationDays.length }
  };

  return {
    id: '',
    user_id: userId,
    insight_type: 'hydration_consistency',
    summary,
    evidence,
    confidence_level: confidenceLevel,
    occurrence_count: correlationCount,
    first_detected_at: lowHydrationDays[0].logged_at,
    last_detected_at: lowHydrationDays[lowHydrationDays.length - 1].logged_at,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export async function analyzeFoodSymptomPattern(userId: string): Promise<Insight[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: foodLogs } = await supabase
    .from('food_logs')
    .select('logged_at, food_name, tags')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  const { data: symptomLogs } = await supabase
    .from('symptoms_log')
    .select('logged_at, symptom_type, severity')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  if (!foodLogs || foodLogs.length < 3 || !symptomLogs || symptomLogs.length < 3) {
    return [];
  }

  const tagCorrelations: Record<string, { count: number; dates: string[]; symptoms: Record<string, number> }> = {};

  foodLogs.forEach((food: FoodLog) => {
    const tags = food.tags || [];

    tags.forEach((tag: string) => {
      const followingSymptoms = symptomLogs.filter((symptom: SymptomLog) =>
        isWithinTimeWindow(symptom.logged_at, food.logged_at, 2, 8) && symptom.severity >= 5
      );

      if (followingSymptoms.length > 0) {
        if (!tagCorrelations[tag]) {
          tagCorrelations[tag] = { count: 0, dates: [], symptoms: {} };
        }
        tagCorrelations[tag].count++;
        tagCorrelations[tag].dates.push(getDateOnly(food.logged_at));
        followingSymptoms.forEach((s: SymptomLog) => {
          tagCorrelations[tag].symptoms[s.symptom_type] = (tagCorrelations[tag].symptoms[s.symptom_type] || 0) + 1;
        });
      }
    });
  });

  const insights: Insight[] = [];

  Object.entries(tagCorrelations).forEach(([tag, data]) => {
    if (data.count >= 3) {
      let confidenceLevel: 'low' | 'medium' | 'high';
      if (data.count >= 7) confidenceLevel = 'high';
      else if (data.count >= 4) confidenceLevel = 'medium';
      else confidenceLevel = 'low';

      const topSymptom = Object.entries(data.symptoms).sort((a, b) => b[1] - a[1])[0];

      const summary = `Foods tagged as "${tag}" appear linked to ${topSymptom[0]} within 2-8 hours after consumption. ${DISCLAIMER}`;

      const evidence: InsightEvidence = {
        frequency: `${data.count} occurrences observed`,
        dates: data.dates.slice(0, 5),
        statistics: { symptomTypes: data.symptoms, tag }
      };

      insights.push({
        id: '',
        user_id: userId,
        insight_type: 'food_symptom',
        summary,
        evidence,
        confidence_level: confidenceLevel,
        occurrence_count: data.count,
        first_detected_at: data.dates[0],
        last_detected_at: data.dates[data.dates.length - 1],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  });

  return insights;
}

export async function analyzeTemporalPattern(userId: string): Promise<Insight[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: bmLogs } = await supabase
    .from('bm_logs')
    .select('logged_at, urgency_level')
    .eq('user_id', userId)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  if (!bmLogs || bmLogs.length < 7) {
    return [];
  }

  const weekdayPatterns: Record<number, number> = {};
  const hourPatterns: Record<number, number> = {};
  const weekendVsWeekday = { weekend: 0, weekday: 0 };

  bmLogs.forEach((bm: any) => {
    const date = new Date(bm.logged_at);
    const dayOfWeek = date.getDay();
    const hour = date.getHours();

    weekdayPatterns[dayOfWeek] = (weekdayPatterns[dayOfWeek] || 0) + 1;
    hourPatterns[hour] = (hourPatterns[hour] || 0) + 1;

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendVsWeekday.weekend++;
    } else {
      weekendVsWeekday.weekday++;
    }
  });

  const insights: Insight[] = [];

  const sortedWeekdays = Object.entries(weekdayPatterns)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count >= 3);

  if (sortedWeekdays.length > 0 && sortedWeekdays[0][1] >= 3) {
    const [day, count] = sortedWeekdays[0];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const summary = `You have a consistent pattern of bowel movements on ${dayNames[parseInt(day)]}s. ${DISCLAIMER}`;

    const evidence: InsightEvidence = {
      frequency: `${count} occurrences on ${dayNames[parseInt(day)]}s`,
      statistics: { weekdayPatterns, dayName: dayNames[parseInt(day)] }
    };

    insights.push({
      id: '',
      user_id: userId,
      insight_type: 'temporal_pattern',
      summary,
      evidence,
      confidence_level: count >= 7 ? 'high' : count >= 4 ? 'medium' : 'low',
      occurrence_count: count,
      first_detected_at: bmLogs[0].logged_at,
      last_detected_at: bmLogs[bmLogs.length - 1].logged_at,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  const sortedHours = Object.entries(hourPatterns)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count >= 3);

  if (sortedHours.length > 0 && sortedHours[0][1] >= 3) {
    const [hour, count] = sortedHours[0];
    const hourInt = parseInt(hour);
    const timeOfDay = hourInt < 12 ? 'morning' : hourInt < 17 ? 'afternoon' : 'evening';

    const summary = `You have a consistent time-of-day pattern with most bowel movements occurring in the ${timeOfDay}. ${DISCLAIMER}`;

    const evidence: InsightEvidence = {
      frequency: `${count} occurrences around ${hourInt}:00`,
      statistics: { hourPatterns, peakHour: hourInt }
    };

    insights.push({
      id: '',
      user_id: userId,
      insight_type: 'temporal_pattern',
      summary,
      evidence,
      confidence_level: count >= 7 ? 'high' : count >= 4 ? 'medium' : 'low',
      occurrence_count: count,
      first_detected_at: bmLogs[0].logged_at,
      last_detected_at: bmLogs[bmLogs.length - 1].logged_at,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  return insights;
}

export async function generateAllInsights(userId: string): Promise<Insight[]> {
  const insights: Insight[] = [];

  const sleepSymptom = await analyzeSleepSymptomCorrelation(userId);
  if (sleepSymptom) insights.push(sleepSymptom);

  const stressUrgency = await analyzeStressUrgencyPattern(userId);
  if (stressUrgency) insights.push(stressUrgency);

  const hydrationConsistency = await analyzeHydrationConsistencyPattern(userId);
  if (hydrationConsistency) insights.push(hydrationConsistency);

  const foodSymptoms = await analyzeFoodSymptomPattern(userId);
  insights.push(...foodSymptoms);

  const temporalPatterns = await analyzeTemporalPattern(userId);
  insights.push(...temporalPatterns);

  return insights;
}

export async function saveInsights(insights: Insight[]): Promise<void> {
  for (const insight of insights) {
    const { data: existing } = await supabase
      .from('user_insights')
      .select('id, occurrence_count')
      .eq('user_id', insight.user_id)
      .eq('insight_type', insight.insight_type)
      .eq('summary', insight.summary)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_insights')
        .update({
          occurrence_count: insight.occurrence_count,
          last_detected_at: insight.last_detected_at,
          confidence_level: insight.confidence_level,
          evidence: insight.evidence,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      const { id, ...insertData } = insight;
      await supabase
        .from('user_insights')
        .insert(insertData);
    }
  }
}

export async function getUserInsights(userId: string): Promise<Insight[]> {
  const { data, error } = await supabase
    .from('user_insights')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('confidence_level', { ascending: false })
    .order('occurrence_count', { ascending: false });

  if (error) throw error;
  return data || [];
}

```

## ./src/utils/retryHelper.ts

```
interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  shouldRetry: (error: unknown) => {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      return (
        errorMessage.includes('timeout') ||
        errorMessage.includes('network') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('408') ||
        errorMessage.includes('502') ||
        errorMessage.includes('503') ||
        errorMessage.includes('504')
      );
    }
    return false;
  },
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === opts.maxRetries || !opts.shouldRetry(error)) {
        throw error;
      }

      const delay = Math.min(
        opts.initialDelay * Math.pow(2, attempt),
        opts.maxDelay
      );

      console.warn(
        `Request failed (attempt ${attempt + 1}/${opts.maxRetries + 1}). Retrying in ${delay}ms...`,
        error
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    return (
      errorMessage.includes('timeout') ||
      errorMessage.includes('408') ||
      errorMessage.includes('aborted')
    );
  }
  return false;
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    return (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('502') ||
      errorMessage.includes('503') ||
      errorMessage.includes('504')
    );
  }
  return false;
}

```

## ./src/utils/supabaseHelper.ts

```
import { PostgrestError } from '@supabase/supabase-js';
import { withRetry, isTimeoutError, isNetworkError } from './retryHelper';

export interface SupabaseResponse<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

export async function executeQuery<T>(
  queryFn: () => Promise<SupabaseResponse<T>>,
  options?: {
    retryOnTimeout?: boolean;
    maxRetries?: number;
  }
): Promise<SupabaseResponse<T>> {
  const { retryOnTimeout = true, maxRetries = 3 } = options || {};

  try {
    if (retryOnTimeout) {
      return await withRetry(queryFn, {
        maxRetries,
        shouldRetry: (error) => {
          return isTimeoutError(error) || isNetworkError(error);
        },
      });
    }
    return await queryFn();
  } catch (error) {
    if (isTimeoutError(error)) {
      return {
        data: null,
        error: new Error(
          'Request timeout. Please check your connection and try again.'
        ),
      };
    }

    if (isNetworkError(error)) {
      return {
        data: null,
        error: new Error(
          'Network error. Please check your connection and try again.'
        ),
      };
    }

    return {
      data: null,
      error: error instanceof Error ? error : new Error('An unexpected error occurred'),
    };
  }
}

export function handleSupabaseError(error: PostgrestError | Error | null): string {
  if (!error) return '';

  if (isTimeoutError(error)) {
    return 'Request timeout. Please try again.';
  }

  if (isNetworkError(error)) {
    return 'Network error. Please check your connection.';
  }

  if ('code' in error && error.code) {
    switch (error.code) {
      case 'PGRST301':
        return 'Resource not found';
      case '23505':
        return 'This record already exists';
      case '23503':
        return 'Related record not found';
      case '42501':
        return 'Permission denied';
      default:
        return error.message || 'An error occurred';
    }
  }

  return error.message || 'An unexpected error occurred';
}

```

## ./src/vite-env.d.ts

```
/// <reference types="vite/client" />

```

## ./supabase/migrations/20260331160220_create_users_and_profiles.sql

```
/*
  # Create Users and Profiles Tables

  ## Overview
  This migration establishes the foundational user authentication and profile management system.
  Leverages Supabase's built-in auth.users table and creates an extended profiles table for additional user data.

  ## Tables Created

  ### 1. profiles
  Extended user profile information linked to Supabase auth.users
  
  **Columns:**
  - `id` (uuid, primary key) - References auth.users(id), ensures 1:1 relationship
  - `email` (text, unique, not null) - User's email address
  - `full_name` (text) - User's display name
  - `date_of_birth` (date) - For age-based insights
  - `gender` (text) - Optional demographic data
  - `height_cm` (numeric) - Height in centimeters for BMI calculations
  - `weight_kg` (numeric) - Current weight in kilograms
  - `timezone` (text) - User's timezone for accurate time-based tracking
  - `notification_preferences` (jsonb) - Flexible notification settings storage
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update timestamp

  ## Security Implementation

  ### Row Level Security (RLS)
  - **Enabled** on profiles table
  - Users can only view their own profile data
  - Users can only update their own profile data
  - New profiles can be created during signup flow

  ### Data Isolation
  - All policies strictly check auth.uid() = id
  - No cross-user data access possible
  - Prevents unauthorized profile viewing or modification

  ## Notes
  - Uses Supabase's built-in auth.users table (no custom user table needed)
  - Profiles table extends auth.users with application-specific data
  - JSONB field allows flexible future additions without schema changes
  - Cascading delete ensures profile cleanup when user account is deleted
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm numeric(5, 2) CHECK (height_cm > 0 AND height_cm < 300),
  weight_kg numeric(5, 2) CHECK (weight_kg > 0 AND weight_kg < 500),
  timezone text DEFAULT 'UTC',
  notification_preferences jsonb DEFAULT '{"email": true, "push": false}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
```

## ./supabase/migrations/20260331160310_create_health_tracking_tables.sql

```
/*
  # Create Health Tracking Tables

  ## Overview
  This migration creates core health tracking tables for bowel movements, symptoms, and food intake.
  Each table includes strict user isolation and comprehensive audit trails.

  ## Tables Created

  ### 1. bm_logs (Bowel Movement Logs)
  Tracks bowel movement events with detailed characteristics
  
  **Columns:**
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, not null) - References auth.users, ensures user ownership
  - `logged_at` (timestamptz, not null) - When the BM occurred
  - `bristol_type` (integer, 1-7) - Bristol Stool Scale classification
  - `color` (text) - Stool color observation
  - `consistency` (text) - Additional consistency notes
  - `urgency` (integer, 1-5) - Urgency level rating
  - `pain_level` (integer, 0-10) - Associated pain intensity
  - `blood_present` (boolean) - Blood detection flag
  - `mucus_present` (boolean) - Mucus detection flag
  - `notes` (text) - Free-form additional observations
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 2. symptom_logs
  Records various health symptoms with severity tracking
  
  **Columns:**
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, not null) - References auth.users
  - `logged_at` (timestamptz, not null) - When symptom was experienced
  - `symptom_type` (text, not null) - Type of symptom (bloating, cramping, nausea, etc.)
  - `severity` (integer, 1-10, not null) - Symptom intensity rating
  - `duration_minutes` (integer) - How long symptom lasted
  - `location` (text) - Body location of symptom
  - `triggers` (text[]) - Potential trigger factors
  - `notes` (text) - Additional context
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 3. food_logs
  Tracks dietary intake for correlation analysis
  
  **Columns:**
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, not null) - References auth.users
  - `logged_at` (timestamptz, not null) - When food was consumed
  - `meal_type` (text, not null) - breakfast, lunch, dinner, snack
  - `food_items` (jsonb, not null) - Array of food items with details
  - `portion_size` (text) - Serving size description
  - `calories` (integer) - Estimated caloric content
  - `tags` (text[]) - Food categories/allergens (dairy, gluten, spicy, etc.)
  - `location` (text) - Where meal was consumed
  - `notes` (text) - Additional observations
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ## Security Implementation

  ### Row Level Security (RLS)
  - **Enabled** on all three tables
  - Each table has four policies: SELECT, INSERT, UPDATE, DELETE
  - All policies enforce user_id = auth.uid() for complete data isolation
  - No cross-user data access possible at database level

  ### Data Integrity
  - Foreign key constraints ensure valid user references
  - Check constraints validate data ranges (severity 1-10, bristol_type 1-7, etc.)
  - NOT NULL constraints on critical fields
  - Cascading deletes ensure data cleanup when users are deleted

  ## Notes
  - All timestamps use timestamptz for timezone-aware storage
  - JSONB fields allow flexible structured data storage
  - Arrays (text[]) enable multi-value fields without junction tables
  - Automatic updated_at triggers maintain audit trails
*/

-- Create bm_logs table
CREATE TABLE IF NOT EXISTS bm_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  bristol_type integer CHECK (bristol_type >= 1 AND bristol_type <= 7),
  color text,
  consistency text,
  urgency integer CHECK (urgency >= 1 AND urgency <= 5),
  pain_level integer CHECK (pain_level >= 0 AND pain_level <= 10),
  blood_present boolean DEFAULT false,
  mucus_present boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create symptom_logs table
CREATE TABLE IF NOT EXISTS symptom_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  symptom_type text NOT NULL,
  severity integer NOT NULL CHECK (severity >= 1 AND severity <= 10),
  duration_minutes integer CHECK (duration_minutes > 0),
  location text,
  triggers text[],
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create food_logs table
CREATE TABLE IF NOT EXISTS food_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_items jsonb NOT NULL,
  portion_size text,
  calories integer CHECK (calories >= 0),
  tags text[],
  location text,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE bm_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- BM Logs policies
CREATE POLICY "Users can view own bm logs"
  ON bm_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bm logs"
  ON bm_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bm logs"
  ON bm_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bm logs"
  ON bm_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Symptom Logs policies
CREATE POLICY "Users can view own symptom logs"
  ON symptom_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom logs"
  ON symptom_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptom logs"
  ON symptom_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptom logs"
  ON symptom_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Food Logs policies
CREATE POLICY "Users can view own food logs"
  ON food_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs"
  ON food_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs"
  ON food_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs"
  ON food_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_bm_logs_updated_at
  BEFORE UPDATE ON bm_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_symptom_logs_updated_at
  BEFORE UPDATE ON symptom_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_logs_updated_at
  BEFORE UPDATE ON food_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bm_logs_user_id ON bm_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_bm_logs_logged_at ON bm_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_bm_logs_user_logged ON bm_logs(user_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_id ON symptom_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_logged_at ON symptom_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_logged ON symptom_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_type ON symptom_logs(symptom_type);

CREATE INDEX IF NOT EXISTS idx_food_logs_user_id ON food_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_food_logs_logged_at ON food_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_logged ON food_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_logs_meal_type ON food_logs(meal_type);
```

## ./supabase/migrations/20260331160348_create_lifestyle_tracking_tables.sql

```
/*
  # Create Lifestyle Tracking Tables

  ## Overview
  This migration creates lifestyle and wellness tracking tables for sleep, stress, hydration, and medication.
  These tables enable holistic health monitoring and correlation analysis with digestive health.

  ## Tables Created

  ### 1. sleep_logs
  Tracks sleep patterns and quality metrics
  
  **Columns:**
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, not null) - References auth.users
  - `sleep_start` (timestamptz, not null) - When user went to sleep
  - `sleep_end` (timestamptz, not null) - When user woke up
  - `duration_minutes` (integer, computed) - Total sleep duration
  - `quality` (integer, 1-10) - Subjective sleep quality rating
  - `interruptions` (integer) - Number of times awakened
  - `felt_rested` (boolean) - Whether user felt rested upon waking
  - `notes` (text) - Additional observations (dreams, disturbances, etc.)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 2. stress_logs
  Records stress levels and contributing factors
  
  **Columns:**
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, not null) - References auth.users
  - `logged_at` (timestamptz, not null) - When stress was assessed
  - `stress_level` (integer, 1-10, not null) - Subjective stress intensity
  - `triggers` (text[]) - Identified stress sources
  - `coping_methods` (text[]) - Strategies used to manage stress
  - `physical_symptoms` (text[]) - Physical manifestations (headache, tension, etc.)
  - `notes` (text) - Additional context
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 3. hydration_logs
  Tracks fluid intake throughout the day
  
  **Columns:**
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, not null) - References auth.users
  - `logged_at` (timestamptz, not null) - When fluid was consumed
  - `amount_ml` (integer, not null) - Volume in milliliters
  - `beverage_type` (text, not null) - water, coffee, tea, juice, etc.
  - `caffeine_content` (boolean) - Whether beverage contains caffeine
  - `notes` (text) - Additional details
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 4. medication_logs
  Tracks medication adherence and effects
  
  **Columns:**
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, not null) - References auth.users
  - `logged_at` (timestamptz, not null) - When medication was taken
  - `medication_name` (text, not null) - Name of medication/supplement
  - `dosage` (text, not null) - Dosage amount and unit
  - `medication_type` (text, not null) - prescription, otc, supplement
  - `taken_as_prescribed` (boolean) - Adherence indicator
  - `side_effects` (text[]) - Any observed adverse effects
  - `notes` (text) - Additional observations
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ## Security Implementation

  ### Row Level Security (RLS)
  - **Enabled** on all four tables
  - Each table has four policies: SELECT, INSERT, UPDATE, DELETE
  - All policies enforce user_id = auth.uid() for complete data isolation
  - Prevents any cross-user data access

  ### Data Integrity
  - Foreign key constraints with CASCADE DELETE
  - Check constraints validate data ranges
  - NOT NULL constraints on essential fields
  - Automatic timestamp management via triggers

  ## Notes
  - Sleep duration can be calculated from start/end times
  - Arrays enable multi-value tracking without additional tables
  - Boolean flags for quick filtering and analysis
  - All times use timestamptz for accurate tracking across timezones
*/

-- Create sleep_logs table
CREATE TABLE IF NOT EXISTS sleep_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_start timestamptz NOT NULL,
  sleep_end timestamptz NOT NULL,
  duration_minutes integer GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (sleep_end - sleep_start)) / 60
  ) STORED,
  quality integer CHECK (quality >= 1 AND quality <= 10),
  interruptions integer DEFAULT 0 CHECK (interruptions >= 0),
  felt_rested boolean,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_sleep_period CHECK (sleep_end > sleep_start)
);

-- Create stress_logs table
CREATE TABLE IF NOT EXISTS stress_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  stress_level integer NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
  triggers text[],
  coping_methods text[],
  physical_symptoms text[],
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create hydration_logs table
CREATE TABLE IF NOT EXISTS hydration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  amount_ml integer NOT NULL CHECK (amount_ml > 0),
  beverage_type text NOT NULL,
  caffeine_content boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create medication_logs table
CREATE TABLE IF NOT EXISTS medication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  medication_name text NOT NULL,
  dosage text NOT NULL,
  medication_type text NOT NULL CHECK (medication_type IN ('prescription', 'otc', 'supplement')),
  taken_as_prescribed boolean DEFAULT true,
  side_effects text[],
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

-- Sleep Logs policies
CREATE POLICY "Users can view own sleep logs"
  ON sleep_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep logs"
  ON sleep_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep logs"
  ON sleep_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep logs"
  ON sleep_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Stress Logs policies
CREATE POLICY "Users can view own stress logs"
  ON stress_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stress logs"
  ON stress_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stress logs"
  ON stress_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stress logs"
  ON stress_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Hydration Logs policies
CREATE POLICY "Users can view own hydration logs"
  ON hydration_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hydration logs"
  ON hydration_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hydration logs"
  ON hydration_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own hydration logs"
  ON hydration_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Medication Logs policies
CREATE POLICY "Users can view own medication logs"
  ON medication_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medication logs"
  ON medication_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medication logs"
  ON medication_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own medication logs"
  ON medication_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_sleep_logs_updated_at
  BEFORE UPDATE ON sleep_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stress_logs_updated_at
  BEFORE UPDATE ON stress_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hydration_logs_updated_at
  BEFORE UPDATE ON hydration_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_logs_updated_at
  BEFORE UPDATE ON medication_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_id ON sleep_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_sleep_start ON sleep_logs(sleep_start DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_start ON sleep_logs(user_id, sleep_start DESC);

CREATE INDEX IF NOT EXISTS idx_stress_logs_user_id ON stress_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_stress_logs_logged_at ON stress_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_stress_logs_user_logged ON stress_logs(user_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_id ON hydration_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_hydration_logs_logged_at ON hydration_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_logged ON hydration_logs(user_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_medication_logs_user_id ON medication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_logged_at ON medication_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_logged ON medication_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_medication_logs_name ON medication_logs(medication_name);
```

## ./supabase/migrations/20260331160422_create_insights_and_reports_tables.sql

```
/*
  # Create Insights and Reports Tables

  ## Overview
  This migration creates tables for storing generated health insights and user/system reports.
  These tables enable persistent storage of analysis results and customizable reporting.

  ## Tables Created

  ### 1. insight_snapshots
  Stores AI-generated or system-calculated health insights
  
  **Columns:**
  - `id` (uuid, primary key) - Unique insight identifier
  - `user_id` (uuid, not null) - References auth.users
  - `insight_type` (text, not null) - Type of insight (pattern, correlation, recommendation, alert)
  - `title` (text, not null) - Brief insight headline
  - `description` (text, not null) - Detailed insight explanation
  - `severity` (text) - Importance level (info, warning, critical)
  - `confidence_score` (numeric) - AI confidence level (0.0-1.0)
  - `data_sources` (jsonb) - References to source data that generated insight
  - `metadata` (jsonb) - Additional structured data (charts, statistics, etc.)
  - `date_range_start` (date) - Start of analysis period
  - `date_range_end` (date) - End of analysis period
  - `is_read` (boolean) - Whether user has viewed insight
  - `is_dismissed` (boolean) - Whether user dismissed insight
  - `created_at` (timestamptz) - When insight was generated
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 2. reports
  Stores user-generated and system-generated health reports
  
  **Columns:**
  - `id` (uuid, primary key) - Unique report identifier
  - `user_id` (uuid, not null) - References auth.users
  - `report_type` (text, not null) - Type of report (summary, detailed, export, medical)
  - `title` (text, not null) - Report title
  - `description` (text) - Report purpose/context
  - `date_range_start` (date, not null) - Start of reporting period
  - `date_range_end` (date, not null) - End of reporting period
  - `format` (text, not null) - Output format (json, pdf, csv)
  - `status` (text, not null) - Generation status (pending, processing, completed, failed)
  - `content` (jsonb) - Report data structure
  - `file_url` (text) - URL to generated file (if applicable)
  - `filters` (jsonb) - Applied filters and parameters
  - `generated_at` (timestamptz) - When report was generated
  - `expires_at` (timestamptz) - When report/file should be deleted
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ## Security Implementation

  ### Row Level Security (RLS)
  - **Enabled** on both tables
  - Each table has four policies: SELECT, INSERT, UPDATE, DELETE
  - All policies enforce user_id = auth.uid() for complete data isolation
  - Insights and reports are strictly private to each user

  ### Data Integrity
  - Foreign key constraints with CASCADE DELETE
  - Check constraints on severity and status enums
  - NOT NULL constraints on essential fields
  - Date range validation constraints
  - Automatic timestamp management

  ## Notes
  - Insights can be auto-generated by backend processes
  - Reports support multiple export formats
  - Metadata/content fields use JSONB for flexible storage
  - Confidence scores enable quality-based filtering
  - Expiration dates support automatic cleanup of old reports
  - Read/dismissed flags enable user interaction tracking
*/

-- Create insight_snapshots table
CREATE TABLE IF NOT EXISTS insight_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('pattern', 'correlation', 'recommendation', 'alert', 'trend')),
  title text NOT NULL,
  description text NOT NULL,
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  confidence_score numeric(3, 2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  data_sources jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  date_range_start date,
  date_range_end date,
  is_read boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_date_range CHECK (date_range_end IS NULL OR date_range_start IS NULL OR date_range_end >= date_range_start)
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('summary', 'detailed', 'export', 'medical', 'custom')),
  title text NOT NULL,
  description text,
  date_range_start date NOT NULL,
  date_range_end date NOT NULL,
  format text NOT NULL CHECK (format IN ('json', 'pdf', 'csv', 'html')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  content jsonb,
  file_url text,
  filters jsonb DEFAULT '{}'::jsonb,
  generated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_report_date_range CHECK (date_range_end >= date_range_start)
);

-- Enable RLS on both tables
ALTER TABLE insight_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Insight Snapshots policies
CREATE POLICY "Users can view own insights"
  ON insight_snapshots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON insight_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON insight_snapshots FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON insight_snapshots FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_insight_snapshots_updated_at
  BEFORE UPDATE ON insight_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_insight_snapshots_user_id ON insight_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_insight_snapshots_created_at ON insight_snapshots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insight_snapshots_user_created ON insight_snapshots(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insight_snapshots_type ON insight_snapshots(insight_type);
CREATE INDEX IF NOT EXISTS idx_insight_snapshots_severity ON insight_snapshots(severity);
CREATE INDEX IF NOT EXISTS idx_insight_snapshots_is_read ON insight_snapshots(user_id, is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_created ON reports(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON reports(generated_at DESC) WHERE generated_at IS NOT NULL;
```

## ./supabase/migrations/20260331160514_add_additional_performance_indexes.sql

```
/*
  # Add Additional Performance Indexes

  ## Overview
  This migration adds composite and specialized indexes to optimize common query patterns
  across all health tracking tables for improved application performance.

  ## Indexes Added

  ### Composite Indexes for Multi-Column Queries
  These indexes optimize queries that filter by user and date ranges simultaneously:
  
  1. **Time-Series Queries**
     - Composite (user_id, logged_at/sleep_start) indexes on all log tables
     - Enables efficient date-range queries per user
     - Supports dashboard and chart data retrieval
  
  2. **Filtering Indexes**
     - Symptom type filtering with user isolation
     - Meal type filtering for dietary analysis
     - Medication name lookup per user
  
  3. **Status Tracking**
     - Unread insights for notification systems
     - Pending/processing reports for background job monitoring

  ### GIN Indexes for JSONB and Array Columns
  These indexes enable efficient queries on structured and multi-value data:
  
  1. **JSONB Indexes**
     - food_items in food_logs (search ingredients)
     - metadata in insight_snapshots (search insight data)
     - content in reports (search report data)
     - filters in reports (query by applied filters)
  
  2. **Array Indexes**
     - tags in food_logs (find by dietary tags)
     - triggers in symptom_logs and stress_logs (find by trigger)
     - side_effects in medication_logs (search adverse effects)

  ### Partial Indexes
  Specialized indexes for specific filtered queries:
  
  1. **Active/Unread Data**
     - Unread insights (is_read = false)
     - Active reports (status IN pending/processing)
  
  2. **Data Quality**
     - Non-null optional fields for validation queries

  ## Performance Benefits
  
  1. **Faster Dashboard Loads**
     - User-specific date-range queries optimized
     - Recent data retrieval accelerated
  
  2. **Efficient Search**
     - Full-text search on arrays and JSONB
     - Tag-based filtering without table scans
  
  3. **Background Processing**
     - Quick lookup of pending work items
     - Efficient notification queries

  ## Notes
  - GIN indexes use more storage but dramatically improve JSONB/array queries
  - Composite indexes follow (user_id, timestamp DESC) pattern for optimal sorting
  - Partial indexes reduce size by indexing only relevant subsets
  - All indexes are created with IF NOT EXISTS for migration safety
*/

-- GIN indexes for JSONB columns (enables efficient searching within JSON structures)
CREATE INDEX IF NOT EXISTS idx_food_logs_food_items_gin ON food_logs USING GIN (food_items);
CREATE INDEX IF NOT EXISTS idx_insight_snapshots_metadata_gin ON insight_snapshots USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_insight_snapshots_data_sources_gin ON insight_snapshots USING GIN (data_sources);
CREATE INDEX IF NOT EXISTS idx_reports_content_gin ON reports USING GIN (content);
CREATE INDEX IF NOT EXISTS idx_reports_filters_gin ON reports USING GIN (filters);

-- GIN indexes for array columns (enables efficient searching within arrays)
CREATE INDEX IF NOT EXISTS idx_food_logs_tags_gin ON food_logs USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_triggers_gin ON symptom_logs USING GIN (triggers);
CREATE INDEX IF NOT EXISTS idx_stress_logs_triggers_gin ON stress_logs USING GIN (triggers);
CREATE INDEX IF NOT EXISTS idx_stress_logs_coping_methods_gin ON stress_logs USING GIN (coping_methods);
CREATE INDEX IF NOT EXISTS idx_stress_logs_physical_symptoms_gin ON stress_logs USING GIN (physical_symptoms);
CREATE INDEX IF NOT EXISTS idx_medication_logs_side_effects_gin ON medication_logs USING GIN (side_effects);

-- Composite indexes for common query patterns (user + time range queries)
CREATE INDEX IF NOT EXISTS idx_bm_logs_user_bristol ON bm_logs(user_id, bristol_type) WHERE bristol_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bm_logs_user_pain ON bm_logs(user_id, pain_level) WHERE pain_level > 0;
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_type_logged ON symptom_logs(user_id, symptom_type, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_severity ON symptom_logs(user_id, severity DESC, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_meal_logged ON food_logs(user_id, meal_type, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_quality ON sleep_logs(user_id, quality) WHERE quality IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stress_logs_user_level ON stress_logs(user_id, stress_level DESC, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_caffeine ON hydration_logs(user_id, logged_at DESC) WHERE caffeine_content = true;
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_type ON medication_logs(user_id, medication_type, logged_at DESC);

-- Partial indexes for filtered queries (smaller, more efficient indexes)
CREATE INDEX IF NOT EXISTS idx_insight_snapshots_unread ON insight_snapshots(user_id, created_at DESC) WHERE is_read = false AND is_dismissed = false;
CREATE INDEX IF NOT EXISTS idx_insight_snapshots_critical ON insight_snapshots(user_id, created_at DESC) WHERE severity = 'critical';
CREATE INDEX IF NOT EXISTS idx_reports_active ON reports(user_id, created_at DESC) WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_reports_completed ON reports(user_id, generated_at DESC) WHERE status = 'completed';

-- Date range indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_insight_snapshots_date_range ON insight_snapshots(user_id, date_range_start, date_range_end);
CREATE INDEX IF NOT EXISTS idx_reports_date_range ON reports(user_id, date_range_start, date_range_end);

-- Index on profile for quick user lookups
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at DESC);
```

## ./supabase/migrations/20260331170325_create_bm_logs_table.sql

```
/*
  # Create Bowel Movement Logs Table

  1. New Tables
    - `bm_logs`
      - `id` (uuid, primary key) - Unique identifier for each log entry
      - `user_id` (uuid, foreign key) - References auth.users
      - `logged_at` (timestamptz) - Timestamp of the bowel movement
      - `bristol_scale` (integer) - Bristol Stool Scale rating (1-7)
      - `urgency_level` (integer) - Urgency rating (1-10)
      - `pain_level` (integer) - Pain rating (1-10)
      - `difficulty_level` (integer) - Difficulty rating (1-10)
      - `incomplete_evacuation` (boolean) - Whether evacuation felt incomplete
      - `blood_present` (boolean) - Presence of blood
      - `mucus_present` (boolean) - Presence of mucus
      - `amount` (text) - Amount: small, medium, or large
      - `notes` (text, optional) - Additional notes
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `bm_logs` table
    - Add policies for authenticated users to manage their own logs
    - Users can only access their own bowel movement logs

  3. Indexes
    - Index on user_id and logged_at for efficient querying
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS bm_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  logged_at timestamptz NOT NULL DEFAULT now(),
  bristol_scale integer NOT NULL CHECK (bristol_scale >= 1 AND bristol_scale <= 7),
  urgency_level integer NOT NULL CHECK (urgency_level >= 1 AND urgency_level <= 10),
  pain_level integer NOT NULL CHECK (pain_level >= 1 AND pain_level <= 10),
  difficulty_level integer NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
  incomplete_evacuation boolean NOT NULL DEFAULT false,
  blood_present boolean NOT NULL DEFAULT false,
  mucus_present boolean NOT NULL DEFAULT false,
  amount text NOT NULL CHECK (amount IN ('small', 'medium', 'large')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bm_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own BM logs"
  ON bm_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own BM logs"
  ON bm_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own BM logs"
  ON bm_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own BM logs"
  ON bm_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS bm_logs_user_logged_at_idx ON bm_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS bm_logs_created_at_idx ON bm_logs(created_at DESC);
```

## ./supabase/migrations/20260331171427_fix_bm_logs_schema_alignment.sql

```
/*
  # Fix BM Logs Schema Alignment

  1. Changes Made
    - Rename `bristol_type` to `bristol_scale` for consistency with frontend code
    - Rename `urgency` to `urgency_level` for consistency with frontend code
    - Add missing `difficulty_level` column (integer, 1-10 scale)
    - Add missing `incomplete_evacuation` column (boolean)
    - Add missing `amount` column (text: small, medium, large)
    - Remove unused `color` column
    - Remove unused `consistency` column

  2. Data Safety
    - Uses safe ALTER TABLE operations
    - Preserves all existing data
    - All operations use IF EXISTS/IF NOT EXISTS checks

  3. Notes
    - This migration aligns the database schema with the frontend expectations
    - Resolves PGRST204 error about missing 'amount' column
    - Maintains backward compatibility by preserving core data
*/

-- Rename columns for consistency
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bm_logs' AND column_name = 'bristol_type'
  ) THEN
    ALTER TABLE bm_logs RENAME COLUMN bristol_type TO bristol_scale;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bm_logs' AND column_name = 'urgency'
  ) THEN
    ALTER TABLE bm_logs RENAME COLUMN urgency TO urgency_level;
  END IF;
END $$;

-- Add missing columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bm_logs' AND column_name = 'difficulty_level'
  ) THEN
    ALTER TABLE bm_logs ADD COLUMN difficulty_level integer NOT NULL DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 10);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bm_logs' AND column_name = 'incomplete_evacuation'
  ) THEN
    ALTER TABLE bm_logs ADD COLUMN incomplete_evacuation boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bm_logs' AND column_name = 'amount'
  ) THEN
    ALTER TABLE bm_logs ADD COLUMN amount text NOT NULL DEFAULT 'medium' CHECK (amount IN ('small', 'medium', 'large'));
  END IF;
END $$;

-- Remove unused columns
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bm_logs' AND column_name = 'color'
  ) THEN
    ALTER TABLE bm_logs DROP COLUMN color;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bm_logs' AND column_name = 'consistency'
  ) THEN
    ALTER TABLE bm_logs DROP COLUMN consistency;
  END IF;
END $$;
```

## ./supabase/migrations/20260331191521_create_insights_table.sql

```
/*
  # Create Insights Storage Table

  1. New Tables
    - `user_insights`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `insight_type` (text) - Type of pattern detected (sleep_symptom, stress_urgency, hydration_consistency, food_symptom, temporal_pattern)
      - `summary` (text) - Clear one-sentence description of the pattern
      - `evidence` (jsonb) - Structured data points supporting the insight
      - `confidence_level` (text) - low, medium, high based on occurrence frequency
      - `occurrence_count` (integer) - Number of times pattern was observed
      - `first_detected_at` (timestamptz) - When pattern first appeared
      - `last_detected_at` (timestamptz) - Most recent occurrence
      - `is_active` (boolean) - Whether insight is still relevant
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_insights` table
    - Add policy for authenticated users to read their own insights
    - Add policy for authenticated users to manage their own insights

  3. Indexes
    - Index on user_id for fast user-specific queries
    - Index on insight_type for filtering by pattern type
    - Index on is_active for retrieving current insights
*/

CREATE TABLE IF NOT EXISTS user_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('sleep_symptom', 'stress_urgency', 'hydration_consistency', 'food_symptom', 'temporal_pattern')),
  summary text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '{}',
  confidence_level text NOT NULL CHECK (confidence_level IN ('low', 'medium', 'high')),
  occurrence_count integer NOT NULL DEFAULT 0,
  first_detected_at timestamptz NOT NULL,
  last_detected_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
  ON user_insights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON user_insights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON user_insights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON user_insights FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_insights_user_id ON user_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_insights_type ON user_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_user_insights_active ON user_insights(is_active);
CREATE INDEX IF NOT EXISTS idx_user_insights_last_detected ON user_insights(last_detected_at DESC);
```

## ./tailwind.config.js

```
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
    },
  },
  plugins: [],
};

```

## ./tsconfig.app.json

```
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}

```

## ./tsconfig.json

```
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}

```

## ./tsconfig.node.json

```
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}

```

## ./vite.config.ts

```
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

```

