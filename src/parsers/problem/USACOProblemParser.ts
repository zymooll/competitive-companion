import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class USACOProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'http://www.usaco.org/current/index.php*',
      'http://www.usaco.org/index.php*',
      'http://usaco.org/current/index.php*',
      'http://usaco.org/index.php*',
    ];
  }

  public canHandlePage(): boolean {
    return window.location.search.includes('page=viewproblem');
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('USACO').setUrl(url);

    const headers = elem.querySelectorAll('.panel > h2');
    task.setName(headers[1].textContent.trim());
    task.setCategory(headers[0].textContent.trim());

    const inputSpec = elem.querySelector('.prob-in-spec h4');
    const outputSpec = elem.querySelector('.prob-out-spec h4');

    if (inputSpec !== null && outputSpec !== null) {
      const filePattern = /\(file (.*)\)/;

      if (filePattern.test(inputSpec.textContent)) {
        task.setInput({
          fileName: /\(file (.*)\)/.exec(inputSpec.textContent)[1],
          type: 'file',
        });
      }

      if (filePattern.test(outputSpec.textContent)) {
        task.setOutput({
          fileName: /\(file (.*)\)/.exec(outputSpec.textContent)[1],
          type: 'file',
        });
      }

      const input = elem.querySelector('pre.in').textContent;
      const output = elem.querySelector('pre.out').textContent;
      task.addTest(input, output);
    } else {
      task.setInteractive(true);
    }

    task.setTimeLimit(4000);
    task.setMemoryLimit(256);

    return task.build();
  }
}
