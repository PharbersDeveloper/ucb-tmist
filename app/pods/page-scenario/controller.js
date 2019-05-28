import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
// import { A } from '@ember/array';
// import rsvp from 'rsvp';

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
		this.set('warning', {
			open: true,
			title: `确认提交`,
			detail: `您将提交本季度决策并输出执行报告，提交后将不可更改决策。`
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
		if (allocateRepresentatives.length < representatives.length) {
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

			// let store = this.get('store'),
			// 	representatives = store.peekAll('representative'),
			// 	representativeIds = representatives.map(ele => ele.get('id')),
			// 	// 验证businessinputs
			// 	businessinputs = store.peekAll('businessinput').filter(ele => ele.get('isNew')),
			// 	notFinishBusinessInputs = businessinputs.filter(ele => !ele.get('isFinish'));

			// // 验证 businessinput 中存在的未输入
			// if (notFinishBusinessInputs.length > 0) {
			// 	// 找到未完成输入的第一个
			// 	let firstNotFinishBI = notFinishBusinessInputs.get('firstObject'),
			// 		hospitalName = firstNotFinishBI.get('destConfig.hospitalConfig.hospital.name'),
			// 		detail = '';

			// 	//	找到未完成输入中的是代表/资源
			// 	if (isEmpty(firstNotFinishBI.get('resourceConfigId'))) {
			// 		detail = `尚未对“${hospitalName}”进行代表分配，请为其分配代表。`;
			// 	} else {
			// 		detail = `尚未对“${hospitalName}”进行资源分配，请为其分配资源。`;
			// 	}
			// 	this.set('warning', {
			// 		open: true,
			// 		title: firstNotFinishBI.get('destConfig.hospitalConfig.hospital.name'),
			// 		detail
			// 	});
			// 	return;
			// 	// 验证是否有代表未被选择
			// } else if (notFinishBusinessInputs.length === 0) {
			// 	let businessinputRepresentatives = businessinputs.map(ele => ele.get('resourceConfig.representativeConfig.representative.id')),
			// 		allocateRepresentatives = businessinputRepresentatives.uniq().filter(item => item),
			// 		differentRepresentatives = null;

			// 	// 判断是不是有代表没有分配工作
			// 	if (allocateRepresentatives.length < 5) {
			// 		differentRepresentatives = representativeIds.concat(allocateRepresentatives).filter(v => !representativeIds.includes(v) || !allocateRepresentatives.includes(v));
			// 		let firstRepId = differentRepresentatives.get('firstObject');

			// 		this.set('warning', {
			// 			open: true,
			// 			title: store.peekRecord('representative', firstRepId).get('name'),
			// 			detail: `尚未对“${store.peekRecord('representative', firstRepId).get('name')}”分配工作，请为其分配。`
			// 		});
			// 		return;
			// 	}
			// 	//	如果没有则应该判断管理决策的输入情况
			// 	this.transitionToRoute('page-result');

			// }

			//	正常逻辑
			// let store = this.get('store'),
			// 	paper = store.peekAll('paper').get('firstObject'),
			// 	paperId = paper.id,
			// 	phase = paper.get('paperinputs').get('length') + 1,
			// 	promiseArray = A([
			// 		store.peekAll('businessinput').save(),
			// 		store.peekAll('managerinput').save(),
			// 		store.peekAll('representativeinput').save()
			// 	]);

			// rsvp.Promise.all(promiseArray)
			// 	.then(data => {
			// 		return store.createRecord('paperinput', {
			// 			paperId,
			// 			phase,
			// 			businessinputs: data[0],
			// 			managerinputs: data[1],
			// 			representativeinputs: data[2]

			// 		}).save();
			// 	}).then(data => {
			// 		let tmpPaperinput = paper.get('paperinputs');

			// 		tmpPaperinput.then(tmp => {
			// 			tmp.pushObject(data);
			// 			paper.save();
			// 		}).then(() => {
			// 			this.transitionToRoute('page-result');
			// 		});

			// 	});
			// 临时逻辑
			// this.transitionToRoute('page-result');
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
		testResult() {
			this.transitionToRoute('page-result');
		}
	}
});
