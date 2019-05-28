import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import Route from '@ember/routing/route'

const Router = EmberRouter.extend({
    location: config.locationType,
    rootURL: config.rootURL
});

Route.reopen({
    showNav: true,
    setupController() {
        this._super(...arguments);
        this.controllerFor('application').set('showNavbar', this.get('showNav'));
    }
})

Router.map(function () {
  this.route('page-login', { path: 'login' });
  this.route('oauth-callback');
  this.route('page-result', { path: 'result' }, function () {
      this.route('review');
  });
  this.route('page-notice', { path: 'notice/:proposal_id' });
  this.route('page-scenario', { path: 'scenario/:proposal_id' }, function () {
      this.route('reference', function () {
          this.route('hospital');
          this.route('member');
          this.route('performance');
      });
      this.route('decision-review');

      this.route('index', function () {
          this.route('hospital-config', { path: 'hospital/:destConfig_id' });
      });
  });
  this.route('page-report', { path: 'report' });
});

export default Router;
