import userEvent from '@testing-library/user-event';
import { asyncType } from '../src';

test('Async Type enters text', async () => {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();
    await asyncType('example');
    expect(textarea).toHaveValue('example');
});