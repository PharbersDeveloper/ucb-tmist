import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import rsvp from 'rsvp';

export default Controller.extend({
	ajax: service(),
	cookies: service(),
	verify: service('service-verify'),
	oauthService: service('oauth_service'),
	testBtn: computed(function () {
		if (ENV.environment === 'development') {
			return true;
		}
		return false;
	}),
	allVerifySuccessful() {
		let scenario = this.get('model.scenario');

		this.set('warning', {
			open: true,
			title: `确认提交`,
			detail: `您将提交本季度（${scenario.get('name')}）决策，
				并进入下一个季度（2019Q2）决策。提交后不可再更改本季度（${scenario.get('name')}）决策`
		});
		this.set('confirmSubmit', true);
		return;
	},
	verifyTotalValue(businessinputs) {
		const verifyService = this.get('verify'),
			model = this.get('model'),
			// resourceConfRep = model.resourceConfRep,
			resourceConfigManager = model.resourceConfManager,
			total = verifyService.verifyInput(businessinputs, resourceConfigManager);

		let { overTotalBusinessIndicators, overTotalBudgets,
				illegal, lowTotalBusinessIndicators,
				lowTotalBudgets } = total,
			warning = { open: false, title: '', detail: '' };

		switch (true) {
		case illegal:
			warning.open = true;
			warning.title = '非法值警告';
			warning.detail = '请输入数字！';
			this.set('warning', warning);
			return false;
		case lowTotalBusinessIndicators:
			warning.open = true;
			warning.title = '总业务指标未达标';
			warning.detail = '您的业务销售额指标尚未完成，请完成总业务指标。';
			this.set('warning', warning);
			return false;
		case lowTotalBudgets:
			warning.open = true;
			warning.title = '总预算剩余';
			warning.detail = '您还有总预算剩余，请分配完毕。';
			this.set('warning', warning);
			return false;
		case overTotalBusinessIndicators:
			warning.open = true;
			warning.title = '总业务指标超额';
			warning.detail = '您的销售额指标设定总值已超出业务总指标限制，请重新分配。';
			this.set('warning', warning);
			return false;
		case overTotalBudgets:
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
	// 提交验证与 new-tmist 不同，需要重新设计，可参考 new-tmist
	judgeOauth() {
		let oauthService = this.get('oauthService'),
			judgeAuth = oauthService.judgeAuth();

		return judgeAuth ? oauthService.redirectUri : null;
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
		const ajax = this.get('ajax'),
			applicationAdapter = this.get('store').adapterFor('application'),
			store = this.get('store'),
			model = this.get('model'),
			paper = model.paper,
			scenario = model.scenario,
			that = this;

		//	正常逻辑
		let version = `${applicationAdapter.get('namespace')}`,
			paperId = paper.id,
			paperinputs = paper.get('paperinputs').sortBy('time'),
			paperinput = paperinputs.lastObject,
			reDeploy = Number(localStorage.getItem('reDeploy')),
			phase = 1,
			promiseArray = A([]);

		promiseArray = A([
			store.peekAll('businessinput').save(),
			// store.peekAll('managerinput').save(),
			// store.peekAll('representativeinput').save()
			store.peekAll('goodsConfigInput').save()
		]);

		rsvp.Promise.all(promiseArray)
			.then(data => {
				if (paper.state === 1 && reDeploy === 1 || paper.state !== 1) {
					return store.createRecord('paperinput', {
						paperId,
						phase,
						scenario: scenario,
						time: new Date().getTime(),
						businessinputs: data[0],
						// managerinputs: data[1],
						// representativeinputs: data[2]
						goodsConfigInputs: data[1]
					}).save();
				}
				paperinput.setProperties({
					phase,
					time: new Date().getTime(),
					businessinputs: data[0],
					// managerinputs: data[1],
					// representativeinputs: data[2]
					goodsConfigInputs: data[1]
				});
				return paperinput.save();
			}).then(data => {
				paper.get('paperinputs').pushObject(data);
				if (state === 1) {
					paper.set('state', state);
				}
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
					this.set('warning', {
						open: true,
						title: `保存成功`,
						detail: `保存成功。`
					});
					return;
				}
				return ajax.request(`${version}/CallRCalculate`, {
					method: 'POST',
					data: JSON.stringify({
						'proposal-id': this.get('model').proposal.id,
						'account-id': this.get('cookies').read('account_id')
					})
				}).then((response) => {
					if (response.status === 'Success') {
						return that.updatePaper(store, paperId, state, that);
					}
					return response;
				}).then(() => {
				}).catch(err => {
					window.console.log('error');
					window.console.log(err);
				});
			});
	},
	updatePaper(store, paperId, state, context) {
		store.findRecord('paper', paperId, { reload: true })
			.then(data => {
				data.set('state', state);
				return data.save();
			}).then(() => {
				this.set('loadingForSubmit', false);

				context.transitionToRoute('page-result');
				return null;
			});
	},
	actions: {
		submit() {
			const judgeAuth = this.judgeOauth(),
				store = this.get('store'),
				representatives = store.peekAll('representative');
			// 验证businessinputs
			// 在page-scenario.business 获取之后进行的设置.
			let businessinputs = store.peekAll('businessinput');

			if (isEmpty(judgeAuth)) {
				window.location = judgeAuth;
				return;
			}
			this.verificationBusinessinputs(businessinputs, representatives);
		},
		saveInputs() {
			// this.set('confirmSubmit', false);

			// let judgeAuth = this.judgeOauth();

			// if (isEmpty(judgeAuth)) {
			// 	window.location = judgeAuth;
			// 	return;
			// }
			// this.sendInput(1);
		},
		confirmSubmit() {
			this.set('warning', { open: false });
			this.set('loadingForSubmit', true);

			// this.sendInput(3);
		},
		testResult() {
			this.transitionToRoute('page-result');
		}
	}
});
