import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import RSVP, { all } from 'rsvp';
const { keys } = Object;

export default Controller.extend({
	cookies: service(),
	oauthService: service('oauth_service'),
	sendInput(state) {
		// const ajax = this.get('ajax'),
		const { store } = this,
			// applicationAdapter = store.adapterFor('application'),
			scenario = this.get('scenario'),
			paper = this.paper;

		//	正常逻辑
		// let version = `${applicationAdapter.get('namespace')}`,
		let paperId = paper.id,
			paperinputs = paper.get('paperinputs').sortBy('time'),
			paperinput = paperinputs.get('lastObject'),
			reDeploy = Number(localStorage.getItem('reDeploy')),
			phase = scenario.get('phase'),
			// 在 page-scenario 页面afterModel hook 中
			businessinputs = this.get('businessInputs'),
			goodsinputs = this.get('goodsInputs');

		all(goodsinputs.map(ele => ele.save()))
			.then(data => {
				businessinputs.forEach(ele => {
					let currentGoodsinputs = data.filterBy('destConfigId', ele.get('destConfig.id'));

					ele.set('goodsinputs', currentGoodsinputs);
				});

				return all(businessinputs.map(ele => ele.save()));
			})
			// rsvp.Promise.all(promiseArray)
			.then(data => {
				// 当点击重新部署按钮(reDeploy === 1 true)
				// 当前周期是未开始(0)/有已经做完的周期，新的周期还未开始(2)/所有周期都已经结束(3)
				// 或者 [1,4].indexOf(paper.state)<0 关卡内没有一个周期是做完的(1)
				//	关卡内有做完的周期但是新的周期还未做完(4)
				if (reDeploy === 1 || [0, 2, 3].indexOf(paper.get('state')) >= 0) {
					return store.createRecord('paperinput', {
						paperId,
						phase,
						scenario: scenario,
						time: new Date().getTime(),
						businessinputs: data
					}).save();
				}

				paperinput.setProperties({
					time: new Date().getTime(),
					businessinputs: data
				});
				return paperinput.save();
			}).then(data => {
				paper.get('paperinputs').pushObject(data);
				if (state === 1 || state === 4) {
					paper.set('state', state);
				}
				let now = null,
					date = new Date(),
					Y = date.getFullYear() + '-',
					M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-',
					D = (date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()) + ' ',
					h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':',
					m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':',
					s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());

				// 输出结果：yyyy-mm-dd hh:mm:ss
				now = Y + M + D + h + m + s;
				paper.set('endTime', now);

				// if (paper.state !== 1 || paper.state !== 4) {
				// 	paper.set('startTime', localStorage.getItem('startTime'));
				// }
				return paper.save();

			}).then(() => {
				let notice = localStorage.getItem('notice');

				localStorage.clear();
				localStorage.setItem('notice', notice);
				if (state === 1 || state === 4) {
					window.location = this.get('oauthService').redirectUri;
					return null;
				}
				return 'test';
				// TODO 无R计算的逻辑
				// return ajax.request(`${version}/CallRCalculate`, {
				// 	method: 'POST',
				// 	data: JSON.stringify({
				// 		'proposal-id': this.get('model').proposal.id,
				// 		'account-id': this.get('cookies').read('account_id')
				// 	})
				// }).then((response) => {
				// 	if (response.status === 'Success') {
				// 		return that.updatePaper(store, paperId, state, that);
				// 	}
				// 	return response;
			}).then((data) => {
				if (!isEmpty(data)) {
					this.transitionToRoute('page-result', paperId);
					return;
				}

			}).catch(err => {
				window.console.log('error');
				window.console.log(err);
			});
		// });
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
				this.sendInput(1);
				return null;
			}
			this.sendInput(4);
		}
	}
});
