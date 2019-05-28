import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import { A } from '@ember/array';

export default Route.extend({
	cookies: service(),
	createManagerInput() {
		return this.get('store').createRecord('managerinput', {
			strategyAnalysisTime: '',
			adminWorkTime: '',
			clientManagementTime: '',
			kpiAnalysisTime: '',
			teamMeetingTime: ''
		});
	},
	createRepInputs(resourceConfigs) {
		let promiseArray = A([]);

		promiseArray = resourceConfigs.map(ele => {
			return this.get('store').createRecord('representativeinput', {
				resourceConfigId: ele.id,
				resourceConfig: ele,
				productKnowledgeTraining: 0,
				salesAbilityTraining: 0,
				regionTraining: 0,
				performanceTraining: 0,
				vocationalDevelopment: 0,
				assistAccessTime: '',
				teamMeeting: '',
				abilityCoach: ''
			});
		});
		return promiseArray;
	},
	//	生成 managerinput
	generateManagerInput(resourceConfigs) {
		return {
			managerInput: this.createManagerInput(),
			representativeInputs: this.createRepInputs(resourceConfigs)
		};
	},
	// 判断是否有 managerinput
	hasManagerInput(paper, resourceConfigs) {
		// 应该根据 paper 中的 state 属性
		let state = paper.get('state'),
			reDeploy = Number(localStorage.getItem('reDeploy')) === 1;

		if (state === 1 && !reDeploy) {
			return {
				managerInput: this.get('store').peekAll('managerinput').get('lastObject'),
				representativeInputs: this.get('store').peekAll('representativeinput')
			};
		}
		return this.generateManagerInput(resourceConfigs);
	},
	// 判断是否有 businessinput
	isHaveBusinessInput(paper, destConfigs, selfGoodsConfigs) {
		let state = paper.get('state'),
			reDeploy = Number(localStorage.getItem('reDeploy')) === 1;

		if (state === 1 && !reDeploy) {
			return this.get('store').peekAll('businessinput');
		}
		return this.generateBusinessInputs(destConfigs, selfGoodsConfigs);
	},
	// normalFlow(newBusinessInputs) {
	// 	return newBusinessInputs;
	// },
	// 生成 businessinputs
	generateBusinessInputs(destConfigs, selfGoodsConfigs) {
		let promiseArray = A([]),
			store = this.get('store');

		promiseArray = destConfigs.map(ele => {
			let goodsConfigInputs = selfGoodsConfigs.map(item => {
				return store.createRecord('goodsConfigInput', {
					goodsConfig: item,
					salesTarget: '',	// 销售目标设定
					budget: ''
				});
			});

			return store.createRecord('businessinput', {
				destConfig: ele,
				destConfigId: ele.id,
				representativeId: '',
				resourceConfigId: '',
				resourceConfig: null,
				salesTarget: '',
				budget: '',
				goodsConfigs: selfGoodsConfigs,
				goodsConfigInputs,
				meetingPlaces: '',
				visitTime: ''
			});
		});
		return promiseArray;
	},
	// beforeModel({ params }) {
	// 	let proposalId = params['page-scenario']['proposal_id'],
	// 		cookies = this.get('cookies'),
	// 		that = this;

	// 	$.ajax({
	// 		method: 'POST',
	// 		url: `/v0/GeneratePaper?proposal-id=${proposalId}
	// 			&account-id=${cookies.read('account_id')}`,
	// 		headers: {
	// 			'Content-Type': 'application/json', // 默认值
	// 			'Accept': 'application/json',
	// 			'Authorization': `Bearer ${cookies.read('access_token')}`
	// 		},
	// 		data: {},
	// 		success: function (res) {
	// 			that.get('store').pushPayload(res);
	// 		},
	// 		error: function () {
	// 		}
	// 	});
	// },
	model(params) {

		const store = this.get('store'),
			cookies = this.get('cookies'),
			noticeModel = this.modelFor('page-notice'),
			scenario = noticeModel.scenario,
			scenarioId = scenario.get('id'),
			proposalId = params['proposal_id'],
			paper = noticeModel.detailPaper;

		let proposal = noticeModel.detailProposal,
			destConfigs = null,
			goodsConfigs = null,
			resourceConfRep = null,
			resourceConfManager = null,
			managerTotalTime = 0,
			managerTotalKpi = 0,
			// inputResource = null,
			businessInputs = null;
		// managerInput = null,
		// representativeInputs = null;
		// reDeploy = Number(localStorage.getItem('reDeploy')) === 1;

		// // 当用户点击继续部署的时候，在 notice 页面已经存在了 inputs的资源
		// if (paper.state === 1 && !reDeploy) {
		// 	managerInput = store.peekAll('managerinput').get('lastObject');
		// 	representativeInputs = store.peekAll('representativeinput');
		// 	businessInputs = store.peekAll('businessinput');
		// }
		return store.findRecord('proposal', proposalId)
			.then(data => {
				proposal = data;
				// 获取 resourceConfig -> 代表
				return store.query('resourceConfig',
					{
						'scenario-id': scenarioId,
						'resource-type': 1
					});
			})
			.then(data => {
				resourceConfRep = data;
				// 获取 resourceConfig -> 经理
				return store.queryRecord('resourceConfig',
					{
						'scenario-id': scenarioId,
						'resource-type': 0
					});
			})
			// 获取经理分配总时间/总点数
			.then(data => {
				resourceConfManager = data;
				// 	let promiseArray = A([
				// 		data.get('managerConfig').get('managerTime'),
				// 		data.get('managerConfig').get('managerKpi')
				// 	]);

				// 	return RSVP.Promise.all(promiseArray);
				// })
				// .then(data => {
				// 	managerTotalTime = data[0];
				// 	managerTotalKpi = data[1];
				// 获取 goodsConfigs 为判断 businessinputs 做准备
				return store.query('goodsConfig',
					{ 'scenario-id': scenarioId });
			}).then(data => {
				goodsConfigs = data;
				return store.query('destConfig',
					{ 'scenario-id': scenarioId });
				// 判断 管理决策是否存在
			}).then(data => {

				destConfigs = data.sortBy('hospitalConfig.potential').reverse();
				// inputResource = this.hasManagerInput(paper, resourceConfRep);
				// managerInput = inputResource.managerInput;
				// representativeInputs = inputResource.representativeInputs;

				let selfGoodsConfigs = goodsConfigs.filter(ele => ele.get('productConfig.productType') === 0);

				businessInputs = this.isHaveBusinessInput(paper, destConfigs, selfGoodsConfigs);

				return hash({
					proposal,
					// managerInput,
					// representativeInputs,
					businessInputs,
					paper,
					scenario,
					paperState: paper.get('state'),
					resourceConfRep,
					resourceConfManager,
					managerTotalTime,
					managerTotalKpi,
					goodsConfigs,
					destConfigs,
					resourceConfig: store.query('resourceConfig',
						{ 'scenario-id': scenarioId }),
					salesConfigs: store.query('salesConfig',
						{
							'scenario-id': scenarioId,
							'proposal-id': proposalId,
							'account-id': cookies.read('account_id')
						})
				});
			});
	},
	afterModel() {
		let applicationController = this.controllerFor('application');

		applicationController.set('testProgress', 2);
	},
	setupController(controller, model) {
		this._super(...arguments);

		// controller.set('managerInput', model.managerInput);
		// controller.set('representativeInputs', model.representativeInputs);
		controller.set('businessInputs', model.businessInputs);
	}
});
