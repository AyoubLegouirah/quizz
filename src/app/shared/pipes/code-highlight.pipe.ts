import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import typescript from 'highlight.js/lib/languages/typescript';
import yaml from 'highlight.js/lib/languages/yaml';
import sql from 'highlight.js/lib/languages/sql';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import http from 'highlight.js/lib/languages/http';

hljs.registerLanguage('java', java);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('http', http);

@Pipe({ name: 'codeHighlight', standalone: true })
export class CodeHighlightPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(code: string, language: string): SafeHtml {
    const lang = hljs.getLanguage(language) ? language : 'bash';
    const highlighted = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
