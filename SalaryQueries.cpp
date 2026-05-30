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
const int mxn = 4e5+10;
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
struct Query {
    char type;
    int a, b;
};
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    int n,q;
    cin >> n >> q;
    vector<int> cur_salary(n+1);
    vector<int> vv;
    vector<Query> queries(q);

    foo(i,1,n){
        cin >> cur_salary[i];
        vv.pb(cur_salary[i]);
    }

    fo(i,q){
        cin >> queries[i].type >> queries[i].a >> queries[i].b;
        if(queries[i].type == '!'){
            vv.pb(queries[i].b);
        }
    }
    sort(ALL(vv));
    vv.erase(unique(ALL(vv)),vv.end());
    int M = SZ(vv);
    
    auto get_rank = [&](int x) {
        return lower_bound(ALL(vv), x) - vv.begin() + 1;
    };

    foo(i,1,n){
        seg.modify(1,1,M,get_rank(cur_salary[i]),1);
    }

    fo(i,q){
        if(queries[i].type == '!'){
            int k = queries[i].a;
            int x = queries[i].b;

            int old = get_rank(cur_salary[k]);
            seg.modify(1,1,M,old,-1);

            int neww = get_rank(x);
            seg.modify(1,1,M,neww,1);

            cur_salary[k] = x;
        }
        else{
            int a = queries[i].a;
            int b = queries[i].b;

            int l = lower_bound(ALL(vv),a) - vv.begin() + 1;
            int r = upper_bound(ALL(vv),b) - vv.begin();

            if(l <= r){
                cout << seg.query(1,1,M,l,r) << '\n';
            }
            else{
                cout << 0 << '\n';
            }
        }
    }
}

