const state = { currentView: 'overview' };
const viewNames = { overview:'总览', products:'商品中心', research:'竞品研究', listing:'Listing 文案', assets:'商品素材', store:'独立站', seo:'SEO 优化', tasks:'任务记录', settings:'设置' };
const toast = document.querySelector('#toast');
function showToast(message){ toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(()=>toast.classList.remove('show'), 2600); }
function navigate(view){
  if(!viewNames[view]) return;
  state.currentView = view;
  document.querySelectorAll('.page-view').forEach(el=>el.classList.toggle('active', el.id === `view-${view}`));
  document.querySelectorAll('.nav-item[data-view]').forEach(el=>el.classList.toggle('active', el.dataset.view === view));
  document.querySelector('#breadcrumbCurrent').textContent = viewNames[view];
  window.scrollTo({top:0, behavior:'smooth'});
}
document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.view)));
document.querySelectorAll('[data-view-target]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.viewTarget)));

const modal = document.querySelector('#newProductModal');
function openModal(){ modal.hidden = false; setTimeout(()=>document.querySelector('#productNameInput').focus(), 30); }
function closeModal(){ modal.hidden = true; }
['newProductBtn','newProductBtn2'].forEach(id=>document.querySelector(`#${id}`)?.addEventListener('click',openModal));
document.querySelector('#closeModal').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.querySelectorAll('.select-choice').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.select-choice').forEach(b=>b.classList.remove('active'));btn.classList.add('active')}));
document.querySelector('#createProductConfirm').addEventListener('click',()=>{const name=document.querySelector('#productNameInput').value.trim() || '新商品项目'; closeModal(); showToast(`已创建「${name}」，正在准备研究工作区`); setTimeout(()=>navigate('research'), 500);});

document.querySelector('#runResearchBtn').addEventListener('click',function(){ this.disabled=true; this.textContent='研究进行中…'; showToast('正在重新分析竞品和用户评论'); setTimeout(()=>{this.disabled=false;this.textContent='↻ 重新研究';showToast('研究完成，发现 2 个新的卖点机会')},1700); });
document.querySelector('#generateListingBtn').addEventListener('click',function(){ this.disabled=true; this.textContent='✦ 生成中…'; showToast('AI 正在结合市场机会生成新版本'); setTimeout(()=>{this.disabled=false;this.textContent='✦ 生成新版本';document.querySelector('#listingTitle').value='PureFlow 便携式净水滤芯水壶，2.4 倍快速过滤，冰箱门适配，一键更换滤芯，适合家庭与户外旅行';showToast('Listing 版本 4 已生成，可继续编辑')},1500); });
document.querySelector('#saveListingBtn').addEventListener('click',()=>showToast('Listing 版本已保存'));
document.querySelector('#generateAssetsBtn').addEventListener('click',function(){ this.disabled=true;this.textContent='✦ 生成中…';showToast('正在生成 4 张商品素材');setTimeout(()=>{this.disabled=false;this.textContent='✦ 生成素材';showToast('素材生成完成，已加入素材库')},1800)});
document.querySelector('#publishBtn').addEventListener('click',function(){this.textContent='发布中…';this.disabled=true;showToast('正在发布商品页到 pureflow-store.demo');setTimeout(()=>{this.textContent='已发布 ✓';this.disabled=false;showToast('商品页已发布，可以打开预览')},1700)});
document.querySelector('#editStoreBtn').addEventListener('click',()=>showToast('页面编辑器将在下一版开放，当前展示预览流程'));
document.querySelector('#runSeoBtn').addEventListener('click',function(){this.disabled=true;this.textContent='审计中…';showToast('正在检查页面结构、关键词和图片描述');setTimeout(()=>{this.disabled=false;this.textContent='✦ 运行审计';showToast('审计完成，发现 1 个高优先级问题')},1500)});

document.querySelectorAll('.approval-item .approve').forEach(btn=>btn.addEventListener('click',()=>{btn.textContent='已确认';btn.disabled=true;btn.classList.add('ghost');showToast('已确认，下一步任务可以继续')}));
document.querySelectorAll('.asset-card').forEach(card=>card.addEventListener('click',()=>{document.querySelectorAll('.asset-card').forEach(c=>c.classList.remove('selected'));card.classList.add('selected');showToast('已选择这张素材作为主图候选')}));
document.querySelectorAll('.suggestions button').forEach(btn=>btn.addEventListener('click',()=>sendMessage(btn.dataset.copilot)));
document.querySelector('#copilotSend').addEventListener('click',()=>sendMessage(document.querySelector('#copilotInput').value));
document.querySelector('#copilotInput').addEventListener('keydown',e=>{if(e.key==='Enter')sendMessage(e.target.value)});
function sendMessage(text){ if(!text?.trim()) return; const log=document.querySelector('#chatLog'); const user=document.createElement('div');user.className='chat-bubble';user.textContent=text;log.appendChild(user);document.querySelector('#copilotInput').value='';setTimeout(()=>{const bot=document.createElement('div');bot.className='bot-bubble';bot.textContent='我会基于当前商品上下文处理这件事。这个 Demo 先展示操作路径，接入真实模型后会在这里返回可编辑结果。';log.appendChild(bot);document.querySelector('.copilot-body').scrollTop=99999},450)}
document.querySelector('#closeCopilot').addEventListener('click',()=>{document.querySelector('.copilot').style.display='none';showToast('AI Copilot 已收起，可刷新页面恢复')});
document.querySelector('#workspaceSwitcher').addEventListener('click',()=>showToast('工作区切换将在团队版开放'));

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeModal()});
