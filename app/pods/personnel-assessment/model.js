import DS from 'ember-data';

export default DS.Model.extend({
	time: DS.attr('formatDateStandard'),
	representativeAbilities: DS.hasMany('representativeAbility'),
	// actionKpis: DS.hasMany('actionKpi'),
	paperInputId: DS.attr('string'),
	scenario: DS.belongsTo()
});
