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
#define mid (l+r)/2
const int mxn = 2e5+10;
int arr[mxn];
struct SEG{
    int seg[mxn*4];
    void modify(int now,int l,int r,int p,int v){
        if(l == r){
            seg[now] += v;
            return;
        }
        if(p <= mid){
            modify(now*2,l,mid,p,v);
        }
        else{
            modify(now*2+1,mid+1,r,p,v);
        }
        seg[now] = seg[now*2] + seg[now*2+1];
    }
    int query(int now,int l,int r,int ql,int qr){
        if(ql > r || qr < l) return 0;
        if(ql <= l && r <= qr){
            return seg[now];
        }
        return query(now*2,l,mid,ql,qr) + query(now*2+1,mid+1,r,ql,qr);
    }
}seg;
struct event{
    int l,r,sign,id;
};

vector<event> ev[mxn];
int ans[mxn];
int main(){
    int n,q;
    cin >> n >> q;

    vector<int> v(n+1);
    vector<int> vv;
    foo(i,1,n){
        cin >> v[i];
        vv.pb(v[i]);
    }
    sort(ALL(vv));
    vv.erase(unique(ALL(vv)),vv.end());
    int M = SZ(vv);

    fo(i,q){
        int a,b,c,d;
        cin >> a >> b >> c >> d;

        int l = lower_bound(ALL(vv),c) - vv.begin() + 1;
        int r = upper_bound(ALL(vv),d) - vv.begin();

        if(l <= r){
            ev[a-1].pb({l,r,-1,i});
            ev[b].pb({l,r,1,i});
        }
        else{
            ans[i] = 0;
        }
    }

    foo(i,0,n){
        if(i > 0){
            int rk = lower_bound(ALL(vv),v[i]) - vv.begin() + 1;
            seg.modify(1,1,M,rk,1);
        }
        for(auto &e : ev[i]){
            int cnt = seg.query(1,1,M,e.l,e.r);
            ans[e.id] += e.sign * cnt;
        }
    }
    fo(i,q){
        cout << ans[i] << '\n';
    }
}