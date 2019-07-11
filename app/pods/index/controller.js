import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
// import { alias } from '@ember/object/computed';
import { computed, observer } from '@ember/object';
// import { isEmpty } from '@ember/utils';
import { all } from 'rsvp';
import { A } from '@ember/array';

export default Controller.extend({
	cookies: service(),
	axios: service(),
	statusService: service(),
	converse: service('service-converse'),
	// notice: localStorage.getItem('notice') !== 'false',
	neverShow: A(['不在显示']),
	xmppResult: observer('xmppMessage.time', function () {
		let clientId = ENV.clientId,
			axios = this.axios,
			accountId = this.get('cookies').read('account_id'),
			proposalId = this.get('model').detailProposal.get('proposal.id'),
			// paperinputId = this.get('paperinputId') || null,
			scenarioId = this.statusService.get('curScenarioId'),
			xmppMessage = this.xmppMessage;

		// if (ENV.environment === 'development') {
		if (xmppMessage['type'] === 'calc') {

			if (xmppMessage['client-id'] !== clientId) {
				if (ENV.environment === 'development') {
					window.console.log('client-id error');
				}
				return;
			} else if (xmppMessage['account-id'] !== accountId) {
				if (ENV.environment === 'development') {
					window.console.log('账户 error');
				}
				return;
			} else if (xmppMessage['proposal-id'] !== proposalId) {
				if (ENV.environment === 'development') {
					window.console.log('proposal-id error');
				}
				return;

				// } else if (xmppMessage['paperInput-id'] !== paperinputId) {
				// 	if (ENV.environment === 'development') {
				// 		window.console.log('输入 error');
				// 	}
				// 	return;
			} else if (xmppMessage['scenario-id'] !== scenarioId) {
				if (ENV.environment === 'development') {
					window.console.log('关卡 error');
				}
				return;
			}
			if (xmppMessage.status === 'ok') {
				if (ENV.environment === 'development') {
					window.console.log('结果已经返回');
				}
				this.set('loading', false);
				this.transitionToRoute('page-result', this.model.detailPaper.get('id'));
				return;
				// return this.updatePaper(this.model.detailPaper.id, this.converse.inputState);
			}
			window.console.log('计算错误');

		} else if (xmppMessage['type'] === 'download') {
			if (xmppMessage['client-id'] !== clientId) {
				if (ENV.environment === 'development') {
					window.console.log('client-id error');
				}
				return;
			} else if (xmppMessage['account-id'] !== accountId) {
				if (ENV.environment === 'development') {
					window.console.log('账户 error');
				}
				return;
			}

			let fileNames = xmppMessage['fileNames'];

			return all(fileNames.map(ele => {
				return axios.axios({
					url: `${ele}`,
					method: 'get',
					responseType: 'blob'
				});
			})).then(data => {
				data.forEach((res, index) => {
					let content = res.data,
						blob = new Blob([content], { type: 'text/csv' }),
						fileName = fileNames[index].split('=')[1];

					if ('download' in document.createElement('a')) { // 非IE下载
						let elink = document.createElement('a');

						elink.download = fileName;
						elink.style.display = 'none';
						elink.href = URL.createObjectURL(blob);
						document.body.appendChild(elink);
						elink.click();
						URL.revokeObjectURL(elink.href); // 释放URL 对象
						document.body.removeChild(elink);
					} else { // IE10+下载
						navigator.msSaveBlob(blob, fileName);
					}
				});
			}).catch(() => {
			});
		}
		// switch (true) {
		// case xmppMessage['client-id'] !== clientId:
		// case xmppMessage['account-id'] !== accountId:
		// case xmppMessage['proposal-id'] !== proposalId:
		// case xmppMessage['paperInput-id'] !== paperinputId:
		// case xmppMessage['scenario-id'] !== scenarioId:
		// 	return;
		// case xmppMessage.status === 'ok':
		// 	return this.updatePaper(this.paperId, this.state);
		// default:
		// 	return;
		// }


	}),
	reports: computed('model.detailPaper', function () {
		let paper = this.get('model.detailPaper'),
			inputs = paper.get('paperinputs');

		return inputs.sortBy('time').reverse();
	}),
	// updatePaper(paperId, state) {
	// 	const that = this;

	// 	this.store.findRecord('paper', paperId, { reload: true })
	// 		.then(data => {
	// 			data.set('state', state);
	// 			return data.save();
	// 		}).then(() => {
	// 			this.set('loadingForSubmit', false);

	// 			that.transitionToRoute('page-result');
	// 			return null;
	// 		});
	// },
	entryMission() {
		localStorage.setItem('isHistory', false);
		let now = null,
			date = new Date(),
			Y = date.getFullYear() + '-',
			M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-',
			D = (date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()) + ' ',
			h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':',
			m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':',
			s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

		// 输出结果：yyyy-mm-dd hh:mm:ss
		now = Y + M + D + h + m + s;

		if (this.get('model').detailPaper.state !== 1) {
			localStorage.setItem('paperStartTime', now);
		}
		if (this.get('model').detailPaper.state === 0) {
			this.get('model').detailPaper.set('startTime', now);
			this.get('model').detailPaper.save().then(() => {
				this.transitionToRoute('page-scenario');
			});
		} else {
			this.transitionToRoute('page-scenario');
		}
		// this.transitionToRoute('page-scenario.business');
	},
	actions: {
		startDeploy(proposalId) {
			// localStorage.setItem('notice', false);

			this.entryMission(proposalId);
			// this.transitionToRoute('page-notice', proposalId);
		},
		reDeploy() {
			let paper = this.get('model.detailPaper');
			// proposalId = this.get('model').detailProposal.get('proposal.id');

			paper.set('state', 3);
			paper.save().then(res => {
				window.console.log(res);
				window.location = ENV.redirectUri;
			});

			// this.set('reDeploy', false);
			// // reDeploy 为 1 的时候，代表用户选择`重新部署`
			localStorage.setItem('reDeploy', 1);
			// this.entryMission(proposalId);

			// this.transitionToRoute('page-notice', proposalId);
		}
	}
});
