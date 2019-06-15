import Service from '@ember/service';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
const { keys } = Object;

export default Service.extend({
	cookies: service(),
	ajax: service(),
	router: service(),
	groupName: '',
	version: 'v0',
	clientId: '5cbe7ab8f4ce4352ecb082a3',
	clientSecret: '5c90db71eeefcc082c0823b2',
	status: 'self',
	scope: 'APP/UCB',
	currentScope: 'UCB',
	host: ENV.host,
	redirectUri: ENV.redirectUri,

	oauthOperation() {
		const ajax = this.get('ajax');

		let host = `${this.get('host')}`,
			version = `${this.get('version')}`,
			resource = 'ThirdParty',
			url = '';

		url = `?client_id=${this.get('clientId')}
                    &client_secret=${this.get('clientSecret')}
                    &scope=${this.get('scope')}
                    &status=${this.get('status')}
                    &redirect_uri=${this.get('redirectUri')}/oauth-callback`.
			replace(/\n/gm, '').
			replace(/ /gm, '').
			replace(/\t/gm, '');
		return ajax.request([host, version, resource, url].join('/'), {
			dataType: 'text'
		}).then(response => {
			return response;
		})
			.catch(err => {
				window.console.log('error');
				window.console.log(err);
			});
	},

	oauthCallback(transition) {
		let version = `${this.get('version')}`,
			host = `${this.get('host')}`,
			resource = 'GenerateAccessToken',
			url = '',
			cookies = this.get('cookies');

		const ajax = this.get('ajax'),
			{ queryParams } = transition;

		if (queryParams.code && queryParams.state) {
			url = `?client_id=${this.get('clientId')}
					&client_secret=${this.get('clientSecret')}
					&scope=${this.get('scope')}
					&redirect_uri=${this.get('redirectUri')}/oauth-callback
					&code=${queryParams.code}
					&state=${queryParams.state}`.
				replace(/\n/gm, '').
				replace(/ /gm, '').
				replace(/\t/gm, '');
			ajax.request([host, version, resource, url].join('/'))
				.then(response => {
					this.removeAuth();
					let expiry = new Date(response.expiry),
						options = {
							domain: '.pharbers.com',
							path: '/',
							expires: expiry
						};

					cookies.write('token', response.access_token, options);
					cookies.write('account_id', response.account_id, options);
					cookies.write('access_token', response.access_token, options);
					cookies.write('refresh_token', response.refresh_token, options);
					cookies.write('token_type', response.token_type, options);
					cookies.write('scope', response.scope, options);
					cookies.write('expiry', response.expiry, options);
					converse.initialize({
						authentication: 'login', // 认证方式，默认为 'login'
						'bosh_service_url': 'http://123.56.179.133:7070/http-bind/',
						'show_controlbox_by_default': false,
						'auto_login': true,
						jid: 'swang@max.logic',
						password: 'swang',
						i18n: 'zh',
						// 'auto_join_rooms':
						// 'view_mode': 'embedded',
						'show_desktop_notifications': false
					});
					this.get('router').transitionTo('index');
				})
				.catch(() => {
					this.get('router').transitionTo('index');
				});
		} else {
			converse.initialize({
				authentication: 'login', // 认证方式，默认为 'login'
				'bosh_service_url': 'http://123.56.179.133:7070/http-bind/',
				'show_controlbox_by_default': false,
				'auto_login': true,
				jid: 'swang@max.logic',
				password: 'swang',
				i18n: 'zh',
				// 'auto_join_rooms':
				'view_mode': 'embedded',
				'show_desktop_notifications': false
			});
			this.get('router').transitionTo('index');
		}
	},

	judgeAuth() {
		let tokenFlag = false,
			scopeFlag = false,
			token = this.get('cookies').read('access_token'),
			scope = this.get('cookies').read('scope'),
			currentScope = this.get('currentScope');

		if (!isEmpty(token)) {
			tokenFlag = true;
		}

		if (!isEmpty(scope)) {
			let scopeString = scope.split('/')[1],
				scopes = scopeString.split(',');

			scopes.forEach(elem => {
				let appScope = elem.split(':')[0],
					scopeGroup = elem.split(':')[1];

				if (appScope === currentScope && scopeGroup !== '' && typeof scopeGroup !== 'undefined') {
					scopeFlag = true;
				}
			});
			scope.split('/')[1].split(',').forEach(elem => {
				let appScope = elem.split(':')[0],
					scopeGroup = elem.split(':')[1];

				if (appScope === currentScope && scopeGroup !== '' && typeof scopeGroup !== 'undefined') {
					this.set('groupName', scopeGroup.split('#')[0]);
				}
			});
		}
		if (tokenFlag && scopeFlag) {
			return true;
		}
		return false;
	},

	removeAuth() {
		this.set('groupName', '');
		let options = { domain: '.pharbers.com', path: '/' },
			cookies = this.get('cookies').read(),
			totalCookies = A([]);

		totalCookies = keys(cookies).map(ele => ele);

		totalCookies.forEach(ele => {
			this.get('cookies').clear(ele, options);
		});
	}
});