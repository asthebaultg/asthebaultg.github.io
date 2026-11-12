// Outil d’orientation pédagogique : aucune donnée envoyée ou stockée.
const $=id=>document.getElementById(id);
const goal=$('goal');
const testMap={
 t_one:['t_one','wilc_one','sign_one'],z_mean:['z_mean','t_one'],binary_one:['binomial'],cat_one:['chi_gof'],
 indep_quant:['welch','student','mann'],indep_hetero:['welch','mann'],indep_ranks:['mann','permutation'],
 paired_quant:['paired','wilc_pair'],paired_ranks:['wilc_pair','sign_one'],
 many_quant:['anova','welch_anova','kruskal'],many_hetero:['welch_anova','kruskal'],many_ranks:['kruskal','permutation'],
 repeated_quant:['rm_anova','friedman','mixed'],repeated_ranks:['friedman','quade'],
 binary_ind:['prop_two','chi_ind','fisher'],binary_pair:['mcnemar'],binary_multi_pair:['cochran'],
 cat_ind:['chi_ind','fisher'],cat_pair:['bowker'],ordinal_ind:['mann','kruskal'],ordinal_pair:['wilc_pair','friedman'],
 cont_corr:['pearson','spearman','kendall'],rank_corr:['spearman','kendall'],cat_corr:['chi_ind','fisher'],
 reg_cont:['linear','mixed'],reg_binary:['logistic','gee'],reg_cat:['multinomial'],reg_ord:['ordinal_logit'],reg_count:['poisson','negative_binom'],
 diag_cont:['shapiro','levene','bartlett','ks'],diag_other:['chi_gof','binomial']
};
if(goal){
 const ids=['goal','variable','groups','dependent','assumptions'];
 const controls=Object.fromEntries(ids.map(id=>[id,$(id)]));
 const box=$('test-result');
 const variableLabels={quant:'quantitative continue',count:'comptage',binary:'qualitative dichotomique',nominal:'qualitative nominale',ordinal:'qualitative ordinale',proportion:'proportion'};
 function change(){
  const g=controls.goal.value,v=controls.variable.value,n=controls.groups.value,d=controls.dependent.value,a=controls.assumptions.value;
  controls.groups.closest('div').hidden=!(g==='compare');
  controls.dependent.closest('div').hidden=!(g==='compare');
  controls.assumptions.closest('div').hidden=!(g==='compare'||g==='association');
  let key='indep_quant';
  if(g==='reference')key=['quant','count'].includes(v)?'t_one':['binary','proportion'].includes(v)?'binary_one':'cat_one';
  if(g==='diagnostic')key=['quant','count'].includes(v)?'diag_cont':'diag_other';
  if(g==='association')key=v==='quant'||v==='count'?'cont_corr':v==='ordinal'?'rank_corr':'cat_corr';
  if(g==='predict')key=v==='quant'?'reg_cont':v==='count'?'reg_count':v==='binary'||v==='proportion'?'reg_binary':v==='ordinal'?'reg_ord':'reg_cat';
  if(g==='compare'){
   const binary=v==='binary'||v==='proportion',nominal=v==='nominal',ord=v==='ordinal';
   if(n==='one')key=binary?'binary_one':nominal?'cat_one':ord?'t_one':'t_one';
   else if(binary)key=d==='paired'?(n==='two'?'binary_pair':'binary_multi_pair'):'binary_ind';
   else if(nominal)key=d==='paired'?'cat_pair':'cat_ind';
   else if(ord)key=d==='paired'?'ordinal_pair':'ordinal_ind';
   else if(d==='paired')key=n==='two'?(a==='nonparam'?'paired_ranks':'paired_quant'):(a==='nonparam'?'repeated_ranks':'repeated_quant');
   else if(n==='two')key=a==='nonparam'?'indep_ranks':a==='hetero'?'indep_hetero':'indep_quant';
   else key=a==='nonparam'?'many_ranks':a==='hetero'?'many_hetero':'many_quant';
  }
  const suggestions=testMap[key]||[];
  box.replaceChildren();
  const h=document.createElement('h3');h.textContent='Méthodes à examiner';box.append(h);
  const p=document.createElement('p');p.textContent=`Pour une variable ${variableLabels[v]}${g==='compare'?' et ce plan de mesure':''}, les pistes suivantes méritent d’être étudiées :`;box.append(p);
  const list=document.createElement('ul');list.className='suggestions-list';
  suggestions.forEach(id=>{const el=$('m-'+id);if(!el)return;const li=document.createElement('li'),a=document.createElement('a');a.href='#'+el.id;a.textContent=el.querySelector('summary').textContent;a.addEventListener('click',()=>{el.hidden=false;el.open=true;});li.append(a);list.append(li);});
  box.append(list);
  const sm=document.createElement('small');sm.textContent='Ces propositions ne sont pas une décision automatique : préciser l’hypothèse, l’unité statistique, les effectifs, les dépendances, la distribution et la taille d’effet. Les conditions des méthodes sont détaillées dans les fiches ci-dessous.';box.append(sm);
 }
 ids.forEach(id=>controls[id].addEventListener('change',change));change();
}

// Répertoire filtrable de méthodes, construit directement dans le HTML.
const family=$('method-family'),search=$('method-search'),scale=$('method-scale'),design=$('method-design');
if(family&&search&&scale&&design){
 const items=[...document.querySelectorAll('#methods-list .method-item')];const count=$('methods-count');
 const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
 const match=(value,filter)=>filter==='all'||norm(value).includes(norm(filter));
 const filter=()=>{
  let n=0;for(const it of items){
   const valid=(family.value==='all'||it.dataset.family===family.value)&&match(it.dataset.scale,scale.value)&&match(it.dataset.design,design.value)&&norm(it.textContent).includes(norm(search.value.trim()));
   it.hidden=!valid;if(valid)n++;
  }
  count.textContent=`${n} méthode${n!==1?'s':''} affichée${n!==1?'s':''} sur ${items.length}`;
 };
 [family,scale,design].forEach(el=>el.addEventListener('change',filter));search.addEventListener('input',filter);filter();
}
// Boutons de copie des tutoriels.
document.querySelectorAll('.tutorial-body pre').forEach(pre=>{
 const btn=document.createElement('button');btn.className='copy-code';btn.type='button';btn.textContent='Copier';btn.setAttribute('aria-label','Copier le code');
 btn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(pre.querySelector('code')?.textContent||pre.textContent);btn.textContent='Copié !';setTimeout(()=>btn.textContent='Copier',1300)}catch(e){btn.textContent='Sélectionnez le code';}});pre.prepend(btn);
});
