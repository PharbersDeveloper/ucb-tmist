import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
// import { A } from '@ember/array';
import { all } from 'rsvp';

export default Controller.extend({
	ajax: service(),
	// axios: service(),
	cookies: service(),
	converse: service('service-converse'),
	verify: service('service-verify'),
	oauthService: service('oauth_service'),
	notice: null,
	testBtn: computed(function () {
		if (ENV.environment === 'development') {
			return true;
		}
		return false;
	}),
	// xmppResult: observer('xmppMessage.time', function () {
	// 	let clientId = ENV.clientId,
	// 		axios = this.axios,
	// 		accountId = this.get('cookies').read('account_id'),
	// 		proposalId = this.get('model').proposal.id,
	// 		// paperinputId = this.get('paperinputId') || null,
	// 		scenarioId = this.get('model').scenario.id,
	// 		xmppMessage = this.xmppMessage;

	// 	// if (ENV.environment === 'development') {
	// 	if (xmppMessage['type'] === 'calc') {

	// 		if (xmppMessage['client-id'] !== clientId) {
	// 			if (ENV.environment === 'development') {
	// 				window.console.log('client-id error');
	// 			}
	// 			return;
	// 		} else if (xmppMessage['account-id'] !== accountId) {
	// 			if (ENV.environment === 'development') {
	// 				window.console.log('账户 error');
	// 			}
	// 			return;
	// 		} else if (xmppMessage['proposal-id'] !== proposalId) {
	// 			if (ENV.environment === 'development') {
	// 				window.console.log('proposal-id error');
	// 			}
	// 			return;

	// 			// } else if (xmppMessage['paperInput-id'] !== paperinputId) {
	// 			// 	if (ENV.environment === 'development') {
	// 			// 		window.console.log('输入 error');
	// 			// 	}
	// 			// 	return;
	// 		} else if (xmppMessage['scenario-id'] !== scenarioId) {
	// 			if (ENV.environment === 'development') {
	// 				window.console.log('关卡 error');
	// 			}
	// 			return;
	// 		}
	// 		if (xmppMessage.status === 'ok') {
	// 			if (ENV.environment === 'development') {
	// 				window.console.log('结果已经返回');
	// 			}
	// 			this.set('loading', false);
	// 			return this.updatePaper(this.paperId, this.state);
	// 		}
	// 		window.console.log('计算错误');

	// 	} else if (xmppMessage['type'] === 'download') {
	// 		if (xmppMessage['client-id'] !== clientId) {
	// 			if (ENV.environment === 'development') {
	// 				window.console.log('client-id error');
	// 			}
	// 			return;
	// 		} else if (xmppMessage['account-id'] !== accountId) {
	// 			if (ENV.environment === 'development') {
	// 				window.console.log('账户 error');
	// 			}
	// 			return;
	// 		}

	// 		let fileNames = xmppMessage['fileNames'];

	// 		return all(fileNames.map(ele => {
	// 			return axios.axios({
	// 				url: `${ele}`,
	// 				method: 'get',
	// 				responseType: 'blob'
	// 			});
	// 		})).then(data => {
	// 			data.forEach((res, index) => {
	// 				let content = res.data,
	// 					blob = new Blob([content], { type: 'text/csv' }),
	// 					fileName = fileNames[index].split('=')[1];

	// 				if ('download' in document.createElement('a')) { // 非IE下载
	// 					let elink = document.createElement('a');

	// 					elink.download = fileName;
	// 					elink.style.display = 'none';
	// 					elink.href = URL.createObjectURL(blob);
	// 					document.body.appendChild(elink);
	// 					elink.click();
	// 					URL.revokeObjectURL(elink.href); // 释放URL 对象
	// 					document.body.removeChild(elink);
	// 				} else { // IE10+下载
	// 					navigator.msSaveBlob(blob, fileName);
	// 				}
	// 			});
	// 		}).catch(() => {
	// 		});
	// 	}
	// 	// switch (true) {
	// 	// case xmppMessage['client-id'] !== clientId:
	// 	// case xmppMessage['account-id'] !== accountId:
	// 	// case xmppMessage['proposal-id'] !== proposalId:
	// 	// case xmppMessage['paperInput-id'] !== paperinputId:
	// 	// case xmppMessage['scenario-id'] !== scenarioId:
	// 	// 	return;
	// 	// case xmppMessage.status === 'ok':
	// 	// 	return this.updatePaper(this.paperId, this.state);
	// 	// default:
	// 	// 	return;
	// 	// }


	// }),
	allVerifySuccessful() {
		let { scenario, proposal } = this.get('model'),
			insideDetail = '并进入下一个季度决策';

		if (scenario.phase === proposal.totalPhase) {
			insideDetail = '并结束优时比区域周期计划测试';
		}
		this.set('warning', {
			open: true,
			title: `确认提交`,
			detail: `您将提交本季度（${scenario.get('name')}）决策，
				${insideDetail}。提交后不可再更改本季度（${scenario.get('name')}）决策。`
		});
		this.set('confirmSubmit', true);
		return;
	},
	verifyTotalValue(businessinputs) {
		const verifyService = this.get('verify'),
			model = this.get('model'),
			{ managerGoodsConfigs, goodsInputs } = model,
			total = verifyService.verifyInput(businessinputs, managerGoodsConfigs, goodsInputs);

		let { overTotalIndicators, overTotalBudgets, illegal, lowTotalIndicators,
				lowTotalBudgets } = total,
			warning = { open: false, title: '', detail: '' };

		switch (true) {
		case illegal:
			warning.open = true;
			warning.title = '非法值警告';
			warning.detail = '请输入数字！';
			this.set('warning', warning);
			return false;
		case !isEmpty(lowTotalIndicators):
			warning.open = true;
			warning.title = '总业务指标未达标';
			warning.detail = '您的业务销售额指标尚未完成，请完成总业务指标。';
			this.set('warning', warning);
			return false;
		case !isEmpty(lowTotalBudgets):
			warning.open = true;
			warning.title = '总预算剩余';
			warning.detail = '您还有总预算剩余，请分配完毕。';
			this.set('warning', warning);
			return false;
		case !isEmpty(overTotalIndicators):
			warning.open = true;
			warning.title = '总业务指标超额';
			warning.detail = '您的销售额指标设定总值已超出业务总指标限制，请重新分配。';
			this.set('warning', warning);
			return false;
		case !isEmpty(overTotalBudgets):
			warning.open = true;
			warning.title = '总预算超额';
			warning.detail = '您的预算设定总值已超出总预算限制，请重新分配。';
			this.set('warning', warning);
			return false;
		default:
			this.allVerifySuccessful();
			return true;
		}

	},
	judgeOauth() {
		let oauthService = this.get('oauthService'),
			judgeAuth = oauthService.judgeAuth();

		// judgeAuth 为 true ,表示cookies 存在，可以进行进一步的操作
		return judgeAuth ? null : oauthService.redirectUri;
	},
	/**
	 * 存在没有完成的 businessinputs
	 * @param  {Array} notFinishBusinessInputs
	 */
	exitNotEntered(notFinishBusinessInputs) {
		let firstNotFinishBI = notFinishBusinessInputs.get('firstObject'),
			hospitalName = firstNotFinishBI.get('destConfig.hospitalConfig.hospital.name'),
			detail = '';

		//	找到未完成输入中的是代表/资源
		if (isEmpty(firstNotFinishBI.get('resourceConfigId'))) {
			detail = `尚未对“${hospitalName}”进行代表分配，请为其分配代表。`;
		} else {
			detail = `尚未对“${hospitalName}”进行资源分配，请为其分配资源。`;
		}
		this.set('warning', {
			open: true,
			title: hospitalName,
			detail
		});
		return;
	},
	/**
	 * 有代表没有分配工作
	 * @param {} representativeIds
	 * @param {*} allocateRepresentatives
	 */
	repNotAlloction(representativeIds, allocateRepresentatives) {
		let differentRepresentatives = representativeIds.concat(allocateRepresentatives).filter(v => !representativeIds.includes(v) || !allocateRepresentatives.includes(v)),
			firstRepId = differentRepresentatives.get('firstObject'),
			representativeName = this.get('store').peekRecord('representative', firstRepId).get('name');

		this.set('warning', {
			open: true,
			title: representativeName,
			detail: `尚未对“${representativeName}”分配工作，请为其分配。`
		});
		return;
	},
	/**
	 * businessinput 都输入完成后，验证是否有代表没有分配
	 * @param  {model} businessinputs
	 * @param  {model} representatives
	 * @return
	 */
	verificationRepHasAllocation(businessinputs, representatives) {
		let businessinputRepresentatives = businessinputs.map(ele => ele.get('resourceConfig.representativeConfig.representative.id')),
			allocateRepresentatives = businessinputRepresentatives.uniq().filter(item => item),
			representativeIds = representatives.map(ele => ele.get('id'));

		// 判断是不是有代表没有分配工作
		// 有代表未分配工作
		if (allocateRepresentatives.length < representatives.get('length')) {
			this.repNotAlloction(representativeIds, allocateRepresentatives);
			return;
		}
		// 代表全部分配完毕
		this.verifyTotalValue(businessinputs, representatives);
		return;
	},
	/**
	 * 验证 businessinput 的完成状态
	 * @param  {model} businessinputs
	 * @param  {model} representatives
	 */
	verificationBusinessinputs(businessinputs, representatives) {
		let notFinishBusinessInputs = businessinputs.filter(ele => !ele.get('isFinish'));

		// 有未完成的businessinputs
		if (notFinishBusinessInputs.length !== 0) {
			this.exitNotEntered(notFinishBusinessInputs);
			return false;
		}
		// this.verifyTotalValue(businessinputs, representatives);
		this.verificationRepHasAllocation(businessinputs, representatives);
	},

	sendInput(state) {
		this.set('loading', true);
		const ajax = this.get('ajax'),
			converse = this.get('converse'),
			applicationAdapter = this.get('store').adapterFor('application'),
			store = this.get('store'),
			model = this.get('model'),
			{ paper, scenario, businessInputs, goodsInputs } = model;

		//	正常逻辑
		let version = `${applicationAdapter.get('namespace')}`,
			paperId = paper.id,
			paperinputs = paper.get('paperinputs').sortBy('time'),
			paperinput = paperinputs.get('lastObject'),
			reDeploy = Number(localStorage.getItem('reDeploy')),
			phase = scenario.get('phase'),
			businessinputs = businessInputs,
			goodsinputs = goodsInputs;

		// goodsinputs.save()
		all(goodsinputs.map(ele => ele.save()))
			.then(data => {
				businessinputs.forEach(ele => {
					let currentGoodsinputs = data.filterBy('destConfigId', ele.get('destConfig.id'));

					ele.set('goodsinputs', currentGoodsinputs);
				});

				// return businessinputs.save();
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
				this.set('paperinputId', data.get('id'));
				paper.get('paperinputs').pushObject(data);
				if (state === 1 || state === 4) {
					paper.set('state', state);
				}
				paper.set('endTime', new Date().getTime());

				// if (paper.state !== 1 || paper.state !== 4) {
				// 	paper.set('startTime', localStorage.getItem('startTime'));
				// }
				return paper.save();

			}).then(() => {
				let notice = localStorage.getItem('notice');

				localStorage.clear();
				localStorage.setItem('notice', notice);
				if (state === 1 || state === 4) {
					this.set('warning', {
						open: true,
						title: `保存成功`,
						detail: `保存成功。`
					});
					this.set('loading', false);
					return null;
				}
				// 重新初始化 xmpp 的链接，保证由于不活跃状态的掉线不重连
				converse.initialize();
				return ajax.request(`${version}/CallRCalculate`, {
					method: 'POST',
					data: JSON.stringify({
						'proposal-id': this.get('model').proposal.id,
						'account-id': this.get('cookies').read('account_id'),
						'scenario-id': scenario.get('id')
					})
				}).then((response) => {
					if (response.status === 'ok') {

						if (ENV.environment === 'development') {
							window.console.log('等待 R 返回中...');
						}
						// this.set('loading', false);
						// this.set('state', state);
						// converse.set('inputState', state);
						this.set('paperId', paperId);
						return this.xmppResult;
					}
				});
			});
	},
	actions: {
		submit() {
			localStorage.setItem('noticeFlag', true);
			const judgeAuth = this.judgeOauth(),
				store = this.get('store'),
				representatives = store.peekAll('representative');
			// 验证businessinputs
			// 在page-scenario.business 获取之后进行的设置.
			let businessinputs = this.model.businessInputs;

			if (!isEmpty(judgeAuth)) {
				window.location = judgeAuth;
				return;
			}
			this.verificationBusinessinputs(businessinputs, representatives);
		},
		saveInputs() {
			this.set('confirmSubmit', false);

			let judgeAuth = this.judgeOauth(),
				scenario = this.get('model').scenario;

			if (!isEmpty(judgeAuth)) {
				window.location = judgeAuth;
				return;
			}

			if (scenario.get('phase') === 1) {
				this.sendInput(1);
				return;
			}
			this.sendInput(4);
		},
		confirmSubmit() {
			localStorage.setItem('noticeFlag', true);
			const model = this.get('model'),
				{ scenario, proposal } = model;

			this.set('warning', { open: false });
			// this.set('loadingForSubmit', true);
			if (scenario.get('phase') < proposal.get('totalPhase')) {
				this.sendInput(2);
				return;
			}
			this.sendInput(3);
		},
		testResult() {
			this.transitionToRoute('page-result', this.paperId);
		},
		closeNotice() {
			this.set('notice', false);
			localStorage.setItem('noticeFlag', false);
		}
	}
});
