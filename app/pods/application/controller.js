import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import RSVP from 'rsvp';
const { keys } = Object;

export default Controller.extend({
	cookies: service(),
	oauthService: service('oauth_service'),
	sendInput(state) {
		const ajax = this.get('ajax'),
			store = this.get('store'),
			{ paper, scenario, proposal } = this.getProperties('paper', 'scenario', 'proposal'),
			applicationAdapter = store.adapterFor('application');

		//	正常逻辑
		let version = `${applicationAdapter.get('namespace')}`,
			paperId = paper.get('id'),
			paperinputs = paper.get('paperinputs').sortBy('time'),
			paperinput = paperinputs.get('lastObject'),
			reDeploy = Number(localStorage.getItem('reDeploy')),
			phase = scenario.get('phase'),
			promiseArray = A([]);

		promiseArray = A([
			store.peekAll('businessinput').save()
		]);

		RSVP.Promise.all(promiseArray)
			.then(data => {
				if (paper.state === 1 && reDeploy === 1 || paper.state !== 1 && paper.state !== 4) {
					return store.createRecord('paperinput', {
						paperId,
						phase,
						scenario: scenario,
						time: new Date().getTime(),
						businessinputs: data[0]
					}).save();
				}
				paperinput.setProperties({
					phase,
					time: new Date().getTime(),
					businessinputs: data[0]
				});
				return paperinput.save();
			}).then(data => {
				paper.get('paperinputs').pushObject(data);
				paper.set('state', state);
				paper.set('endTime', new Date().getTime());

				if (paper.state !== 1) {
					paper.set('startTime', localStorage.getItem('startTime'));
				}
				return paper.save();

			}).then(() => {
				let notice = localStorage.getItem('notice');

				localStorage.clear();
				localStorage.setItem('notice', notice);
				if (state === 1) {
					window.location = this.get('oauthService').redirectUri;
					return;
				}
				return ajax.request(`${version}/CallRCalculate`, {
					method: 'POST',
					data: JSON.stringify({
						'proposal-id': proposal.get('id'),
						'account-id': this.get('cookies').read('account_id')
					})
				}).then((response) => {
					if (response.status === 'Success') {
						this.transitionToRoute('page-result');
						return;
					}

					return response;
				}).catch(err => {
					window.console.log('error');
					window.console.log(err);
				});
			});
	},
	judgeOauth() {
		let oauthService = this.get('oauthService'),
			judgeAuth = oauthService.judgeAuth();

		return judgeAuth ? oauthService.redirectUri : null;
	},
	actions: {
		/**
		 * 账号设置
		 */
		setting() {

		},
		/**
		 * 返回首页
		 */
		backToApplication() {

		},
		/**
		 * 退出账号
		 */
		logout() {
			let cookies = this.get('cookies').read(),
				totalCookies = A([]);

			totalCookies = keys(cookies).map(ele => ele);

			new RSVP.Promise((resolve) => {
				totalCookies.forEach(ele => {
					this.get('cookies').clear(ele, { domain: 'pharbers.com', path: '/' });
				});
				localStorage.clear();
				return resolve(true);
			}).then(() => {
				window.location.reload();
			});
		},
		endMission() {
			let url = this.get('oauthService').get('redirectUri');

			window.location = url;
		},
		saveInputEndMission() {
			let judgeAuth = this.judgeOauth();

			if (isEmpty(judgeAuth)) {
				window.location = judgeAuth;
				return;
			}
			this.toggleProperty('exitMission');
		},
		resultPageEndMission() {
			window.location = ENV.redirectUri;

		},
		saveInputs() {
			let scenario = this.get('scenario');

			this.set('exitMission', false);
			if (scenario.get('phase') === 1) {
				// this.sendInput(1);
				return null;
			}
			// this.sendInput(4);
		}
	}
});
