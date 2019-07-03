import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('transform:format-date-standard', 'Unit | Transform | format date standard', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let transform = this.owner.lookup('transform:format-date-standard');
    assert.ok(transform);
  });
});
