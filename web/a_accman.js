import{createClient}from'@supabase/supabase-js';

const supabaseUrl='https://hyljgkbyaekgfwrovjnj.supabase.co';
const supabaseKey='sb_publishable_OxfQbHyrkLVXrisOS5kUhw_1LhfM_dD';
const supabase=createClient(supabaseUrl,supabaseKey,{auth:{persistSession:true,autoRefreshToken:true}});

const accountsTableBody=document.getElementById('accountsTableBody');
const addAccountButton=document.getElementById('addAccountButton');
const accountModal=document.getElementById('accountModal');
const closeAccountModal=document.getElementById('closeAccountModal');
const addAccountForm=document.getElementById('addAccountForm');
const accountMessage=document.getElementById('accountMessage');
const createAccountButton=document.getElementById('createAccountButton');
const accountSearch=document.getElementById('accountSearch');
const deleteModal=document.getElementById('deleteModal');
const closeDeleteModal=document.getElementById('closeDeleteModal');
const cancelDeleteButton=document.getElementById('cancelDeleteButton');
const confirmDeleteButton=document.getElementById('confirmDeleteButton');
const deleteAccountName=document.getElementById('deleteAccountName');

let accounts=[];
let accountToDelete=null;

async function checkAdmin(){
    const{data:{user},error}=await supabase.auth.getUser();
    if(error||!user){
        alert('You must be logged in to access Account Management.');
        window.location.href='/web/home.html';
        return false;
    }
    const{data:profile,error:profileError}=await supabase.from('profiles').select('role').eq('id',user.id).single();
    if(profileError||!profile||profile.role!=='admin'){
        alert('Only administrators can access Account Management.');
        window.location.href='/web/home.html';
        return false;
    }
    return true;
}

async function loadAccounts(){
    accountsTableBody.innerHTML='<tr><td colspan="5" class="loading">Loading accounts...</td></tr>';

    const{data,error}=await supabase.from('profiles').select('id,full_name,email,role,created_at').in('role',['admin','staff']).order('created_at',{ascending:false});

    console.log('PROFILES:',data);
    console.log('PROFILE ERROR:',error);

    if(error){
        accountsTableBody.innerHTML=`<tr><td colspan="5" class="empty-accounts">Failed to load accounts.<br>${escapeHTML(error.message)}</td></tr>`;
        return;
    }

    accounts=data||[];
    displayAccounts(accounts);
}

function displayAccounts(list){
    accountsTableBody.innerHTML='';

    if(!list.length){
        accountsTableBody.innerHTML='<tr><td colspan="5" class="empty-accounts">No accounts found.</td></tr>';
        return;
    }

    list.forEach(account=>{
        const row=document.createElement('tr');
        const name=account.full_name||'Unnamed User';
        const email=account.email||'No email';
        const role=account.role||'No role';
        const roleClass=role.toLowerCase()==='admin'?'role-admin':'role-staff';

        row.innerHTML=`
            <td>${escapeHTML(name)}</td>
            <td>${escapeHTML(email)}</td>
            <td><span class="role-badge ${roleClass}">${escapeHTML(role)}</span></td>
            <td><small>${escapeHTML(account.id)}</small></td>
            <td><button class="delete-account-btn" title="Delete Account"><i class="fa-solid fa-trash"></i></button></td>`;

        row.querySelector('.delete-account-btn').addEventListener('click',()=>openDeleteModal(account));
        accountsTableBody.appendChild(row);
    });
}

accountSearch.addEventListener('input',function(){
    const search=this.value.toLowerCase().trim();
    const filtered=accounts.filter(account=>
        (account.full_name||'').toLowerCase().includes(search)||
        (account.email||'').toLowerCase().includes(search)||
        (account.role||'').toLowerCase().includes(search)
    );
    displayAccounts(filtered);
});

addAccountButton.addEventListener('click',()=>{
    addAccountForm.reset();
    accountMessage.textContent='';
    accountMessage.className='account-message';
    accountModal.style.display='flex';
});

closeAccountModal.addEventListener('click',()=>accountModal.style.display='none');

accountModal.addEventListener('click',e=>{
    if(e.target===accountModal)accountModal.style.display='none';
});

addAccountForm.addEventListener('submit',async e=>{
    e.preventDefault();

    const firstName=document.getElementById('firstName').value.trim();
    const lastName=document.getElementById('lastName').value.trim();
    const email=document.getElementById('accountEmail').value.trim();
    const password=document.getElementById('accountPassword').value;
    const role=document.getElementById('accountRole').value;

    if(!firstName||!lastName||!email||!password){
        showMessage('Please fill in all fields.','error');
        return;
    }

    if(password.length<6){
        showMessage('Password must be at least 6 characters.','error');
        return;
    }

    createAccountButton.disabled=true;
    createAccountButton.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Creating...';

    try{
        const{data,error}=await supabase.functions.invoke('manage-account',{
            body:{
                action:'create',
                full_name:`${firstName} ${lastName}`,
                email,
                password,
                role
            }
        });

        if(error)throw new Error(error.message);
        if(data?.error)throw new Error(data.error);

        showMessage('Account created successfully!','success');
        addAccountForm.reset();
        await loadAccounts();

        setTimeout(()=>{
            accountModal.style.display='none';
            accountMessage.textContent='';
        },1000);
    }catch(error){
        console.error(error);
        showMessage(error.message||'Failed to create account.','error');
    }finally{
        createAccountButton.disabled=false;
        createAccountButton.innerHTML='<i class="fa-solid fa-user-plus"></i> Create Account';
    }
});

function openDeleteModal(account){
    accountToDelete=account;
    deleteAccountName.textContent=` ${account.full_name||account.email||'this account'}`;
    deleteModal.style.display='flex';
}

function closeDeleteDialog(){
    deleteModal.style.display='none';
    accountToDelete=null;
}

closeDeleteModal.addEventListener('click',closeDeleteDialog);
cancelDeleteButton.addEventListener('click',closeDeleteDialog);

deleteModal.addEventListener('click',e=>{
    if(e.target===deleteModal)closeDeleteDialog();
});

confirmDeleteButton.addEventListener('click',async()=>{
    if(!accountToDelete)return;

    confirmDeleteButton.disabled=true;
    confirmDeleteButton.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';

    try{
        const{data:{user}}=await supabase.auth.getUser();

        if(!user)throw new Error('You are not logged in.');
        if(accountToDelete.id===user.id)throw new Error('You cannot delete your own account.');

        const{data,error}=await supabase.functions.invoke('manage-account',{
            body:{action:'delete',user_id:accountToDelete.id}
        });

        if(error)throw new Error(error.message);
        if(data?.error)throw new Error(data.error);

        closeDeleteDialog();
        await loadAccounts();
    }catch(error){
        console.error(error);
        alert(error.message||'Failed to delete account.');
    }finally{
        confirmDeleteButton.disabled=false;
        confirmDeleteButton.innerHTML='Delete Account';
    }
});

function showMessage(message,type){
    accountMessage.textContent=message;
    accountMessage.className=`account-message ${type}`;
}

function escapeHTML(value){
    return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}

async function initializeAccountManagement(){
    const isAdmin=await checkAdmin();
    if(isAdmin)await loadAccounts();
}

initializeAccountManagement();