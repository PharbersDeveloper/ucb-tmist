import DS from 'ember-data';

export default DS.Model.extend({
	// hospitalName: DS.attr('string'),
	// productName: DS.attr('string'),
	// potential: DS.attr('number'),	//	潜力
	patientCount: DS.attr('number'),	// 患者人数
	quotaAchievement: DS.attr('number'),	//	指标达成率
	quotaContribute: DS.attr('number'),	// 指标贡献率
	quotaGrowth: DS.attr('number'),		// 指标增长率
	sales: DS.attr('number'),
	salesContribute: DS.attr('number'),	// 销售额贡献率
	salesGrowth: DS.attr('number'),	// 销售增长率
	salesQuota: DS.attr('number'),	// 销售指标
	salesMonthOnMonth: DS.attr('number'),// 销售额环比增长
	salesYearOnYear: DS.attr('number'),		// 销售额同比增长
	share: DS.attr('number'),	// 份额
	ytdSales: DS.attr('number'),	// YTD 销售额
	city: DS.belongsTo(),
	cities: DS.hasMany('city')
	// goodsConfig: DS.belongsTo()
});
