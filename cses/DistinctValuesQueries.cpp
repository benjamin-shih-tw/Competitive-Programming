#pragma GCC optimize("O3,unroll-loops")
#include <bits/stdc++.h>
#pragma GCC target("avx2,bmi,bmi2,lzcnt,popcnt")
using namespace std;
using ll = long long;
#define pii pair<int,int>
#define SZ(x) ((int)(x).size())
#define ALL(x) (x).begin(),(x).end()
#define fo(i,n) for(int i = 0 ; i < (n) ; i++)
#define foo(i,a,b) for(int i = (a) ; i <= (b) ; i++)
#define F first
#define S second
#define pb push_back
const int mxn = 2e5+10;
int bit[mxn];
int arr[mxn];
int ans[mxn];
void modify(int p,int v){
    for(; p < mxn ; p += p&-p) bit[p] += v;
}
int getval(int p){
    int re = 0; for(; p > 0 ; p-=p&-p) re += bit[p]; return re;
}
struct Q{
    int l,r,id;
    bool operator<(const Q & other) const{
        return r < other.r;
    }
};
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    int n,q;
    cin >> n >> q;
    foo(i,1,n) cin >> arr[i];
    vector<Q> que(q);
    fo(i,q){
        cin >> que[i].l >> que[i].r;
        que[i].id = i;
    }
    sort(ALL(que));

    map<int,int> last;
    int idx = 0;
    foo(i,1,n){
        int val = arr[i];

        if(last.count(val)){
            modify(last[val],-1);
        }
        modify(i,1);
        last[val] = i;

        while(idx < q and que[idx].r == i){
            int l = que[idx].l;
            int id = que[idx].id;
            ans[id] = getval(i) - getval(l-1);
            idx++;
        }
    }
    fo(i,q){
        cout << ans[i] << '\n';
    }
}