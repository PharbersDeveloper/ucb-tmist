import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
	ajax: service(),
	cookies: service(),
	clientId: '5cbe7ab8f4ce4352ecb082a3',
	clientSecret: '5c90db71eeefcc082c0823b2',
	beforeModel(transition) {
		const ajax = this.get('ajax'),
			{ queryParams } = transition,
			cookies = this.get('cookies'),
			applicationAdapter = this.get('store').adapterFor('application');

		let version = `${applicationAdapter.get('namespace')}`,
			host = `${applicationAdapter.get('serviceHost')}`,
			resource = 'GenerateAccessToken',
			scope = 'App/System:[UCB]',
			url = '',
			redirectUri = `${applicationAdapter.get('host')}/oauth-callback`;

		if (queryParams.code && queryParams.state) {
			url = `?response_type=authorization_code
					&client_id=${this.get('clientId')}
					&client_secret=${this.get('clientSecret')}
					&scope=${scope}
					&redirect_uri=${redirectUri}
					&code=${queryParams.code}
					&state=${queryParams.state}
					&status=self`.
				replace(/\n/gm, '').
				replace(/ /gm, '').
				replace(/\t/gm, '');
			ajax.request([host, version, resource, url].join('/'))
				.then(response => {
					let expiry = response.expiry,
						parseExpiry = Date.parse(expiry),
						currentDate = Date.parse(new Date()),
						maxAge = Math.floor((parseExpiry - currentDate) / 1000);

					// cookies.write('account_id', response.account_id);
					cookies.write('account_id', '5c4552455ee2dd7c36a94a9e', {
						maxAge: maxAge,
						domain: 'pharbers.com'
					});
					cookies.write('access_token', response.access_token, {
						maxAge: maxAge,
						domain: 'pharbers.com'

					});
					cookies.write('refresh_token', response.refresh_token, {
						maxAge: maxAge,
						domain: 'pharbers.com'

					});
					// cookies.write('expiry', response.expiry);
					cookies.write('token_type', response.token_type, {
						maxAge: maxAge,
						domain: 'pharbers.com'

					});
					this.transitionTo('application');
				});
		} else {
			this.transitionTo('application');
		}
	}
});
