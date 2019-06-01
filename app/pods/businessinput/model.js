import DS from 'ember-data';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default DS.Model.extend({
	destConfigId: DS.attr('string'),	// 待删除
	resourceConfigId: DS.attr('string'),
	total: computed('goodsinputs.@each.{salesTarget,budget}', 'resourceConfigId', function () {
		let goodsInputs = this.get('goodsinputs'),
			totalSalesTarget = 0,
			totalBudget = 0,
			isFinish = A([]);

		goodsInputs.forEach(goodsInput => {
			let salesTarget = goodsInput.get('salesTarget'),
				budget = goodsInput.get('budget');

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
	totalSalesTarget: alias('total.totalSalesTarget'),// 总销售指标设定
	totalBudget: alias('total.totalBudget'),// 总预算费用
	isFinish: alias('total.isFinish'),	// 是否填写完毕 true-> 完毕
	destConfig: DS.belongsTo(),
	resourceConfig: DS.belongsTo(),
	// goodsConfigs: DS.hasMany(),
	goodsinputs: DS.hasMany()
});