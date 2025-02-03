import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { php } from '@codemirror/lang-php';
import { rust } from '@codemirror/lang-rust';
import { sql } from '@codemirror/lang-sql';
import { xml } from '@codemirror/lang-xml';
import { yaml } from '@codemirror/lang-yaml';
// 根据文件扩展名选择合适的语言扩展
export const getLanguageExtension = (ext: string) => {
    switch (ext.toLowerCase()) {
      // JavaScript/TypeScript
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'mjs':
      case 'cjs':
        return javascript();
      
      // Python
      case 'py':
      case 'pyw':
      case 'pyi':
      case 'pyc':
        return python();
      
      // Web 相关
      case 'css':
      case 'scss':
      case 'sass':
      case 'less':
        return css();
      case 'html':
      case 'htm':
        return html();
      case 'xml':
      case 'svg':
      case 'xhtml':
        return xml();
      
      // 数据格式
      case 'json':
      case 'jsonc':
        return json();
      case 'yaml':
      case 'yml':
        return yaml();
      
      // 系统编程
      case 'c':
      case 'cpp':
      case 'cc':
      case 'cxx':
      case 'h':
      case 'hpp':
      case 'hxx':
        return cpp();
      case 'rs':
        return rust();
      
      // 后端语言
      case 'java':
        return java();
      case 'php':
      case 'phtml':
        return php();
      
      // 数据库
      case 'sql':
      case 'mysql':
      case 'pgsql':
      case 'sqlite':
        return sql();
      
      // 文档
      case 'md':
      case 'markdown':
      case 'mdown':
        return markdown();
      
      default:
        return javascript();
    }
  }