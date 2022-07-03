import { expect } from 'chai';
import { main } from '../src/index';

test('should return true when calling main()', () => {
    expect(main()).to.be.true;
})
