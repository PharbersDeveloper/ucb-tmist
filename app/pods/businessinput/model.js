import DS from 'ember-data';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default DS.Model.extend({
	destConfigId: DS.attr('string'),	// 待删除
	resourceConfigId: DS.attr('string'),
	total: computed('goodsConfigInputs.@each.{salesTarget,budget}', 'resourceConfigId', function () {
		let goodsConfigInputs = this.get('goodsConfigInputs'),
			totalSalesTarget = 0,
			totalBudget = 0,
			isFinish = A([]);

		goodsConfigInputs.forEach(goodsConfigInput => {
			let salesTarget = goodsConfigInput.get('salesTarget'),
				budget = goodsConfigInput.get('budget');

			totalSalesTarget += Number(salesTarget);
			totalBudget += Number(budget);
			isFinish.push(...[salesTarget, budget, this.get('resourceConfigId')]);
		});
		return {
			totalSalesTarget,
			totalBudget,
			isFinish: isFinish.every(ele => !isEmpty(ele))
		};
	}),
	totalSalesTarget: alias('total.totalSalesTarget'),
	totalBudget: alias('total.totalBudget'),
	isFinish: alias('total.isFinish'),
	// salesTarget: DS.attr('number'),	// 销售目标设定
	// budget: DS.attr('number'),	// 预算费用
	// meetingPlaces: DS.attr('number'),	//	会议名额 ucb中删除
	// visitTime: DS.attr('number'),	// ucb中删除
	destConfig: DS.belongsTo(),
	resourceConfig: DS.belongsTo(),
	goodsConfigs: DS.hasMany(),
	goodsConfigInputs: DS.hasMany()
});